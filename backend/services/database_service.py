from typing import Optional, Dict, Any, List
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, date
import uuid
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def test_connection(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tests a database connection with the provided configuration.
        Expected config: {host, port, user, password, database, db_type}
        Returns: {status: "success" | "error", message: str}
        """
        db_type = config.get("db_type", "postgresql")
        user = config.get("user")
        password = config.get("password")
        host = config.get("host")
        port = config.get("port")
        database = config.get("database")

        if db_type == "postgresql":
            url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        elif db_type == "mysql":
            url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        else:
            return {"status": "error", "message": f"Unsupported database type: {db_type}"}

        try:
            # We use a short timeout for the test
            engine = create_engine(url, connect_args={"connect_timeout": 5})
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return {"status": "success", "message": "Connection successful!"}
        except SQLAlchemyError as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return {"status": "error", "message": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error during connection test: {str(e)}")
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}

    def introspect_schema(self, config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Introspects the database to retrieve table schemas and sample rows.
        """
        db_type = config.get("db_type", "postgresql")
        user = config.get("user")
        password = config.get("password")
        host = config.get("host")
        port = config.get("port")
        database = config.get("database")

        if db_type == "postgresql":
            url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        elif db_type == "mysql":
            url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        else:
            raise ValueError(f"Unsupported database type: {db_type}")

        engine = create_engine(url, connect_args={"connect_timeout": 10})
        inspector = inspect(engine)
        
        schema_data = []
        
        try:
            with engine.connect() as connection:
                for table_name in inspector.get_table_names():
                    columns = []
                    for col in inspector.get_columns(table_name):
                        columns.append({
                            "name": col["name"],
                            "type": str(col["type"]),
                            "is_primary": col.get("primary_key", False)
                        })
                    
                    sample_rows = []
                    try:
                        # Fetch up to 3 sample rows
                        # Using text() and quote table_name to handle mixed case
                        result = connection.execute(text(f'SELECT * FROM "{table_name}" LIMIT 3'))
                        
                        # Serialize row data to make it JSON friendly
                        for row in result.mappings().all():
                            serialized_row = {}
                            for k, v in row.items():
                                if isinstance(v, (datetime, date)):
                                    serialized_row[k] = v.isoformat()
                                elif isinstance(v, uuid.UUID):
                                    serialized_row[k] = str(v)
                                elif isinstance(v, Decimal):
                                    serialized_row[k] = float(v)
                                else:
                                    if type(v).__name__ in ('memoryview', 'bytes'):
                                        serialized_row[k] = "<binary_data>"
                                    else:
                                        serialized_row[k] = str(v) if not isinstance(v, (int, float, bool, type(None), str)) else v
                            sample_rows.append(serialized_row)
                    except Exception as e:
                        logger.warning(f"Could not fetch sample rows for {table_name}: {e}")
                    
                    schema_data.append({
                        "table_name": table_name,
                        "columns": columns,
                        "sample_rows": sample_rows
                    })
            return schema_data
        except SQLAlchemyError as e:
            logger.error(f"Schema introspection failed: {str(e)}")
            raise

database_service = DatabaseService()
