from typing import Optional, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
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

database_service = DatabaseService()
