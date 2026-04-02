from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.domain import DataSource, SchemaManifest, QueryHistory
from services.agent_service import agent_service
import uuid
import time
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from pydantic import BaseModel

router = APIRouter()

@router.post("/generate")
async def generate_sql_query(
    datasource_id: uuid.UUID,
    prompt: str,
    session: Session = Depends(get_session)
):
    datasource = session.get(DataSource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    dialect = datasource.db_type if datasource.db_type else "postgresql"
    driver = "mysql+pymysql" if dialect == "mysql" else dialect
    uri = f"{driver}://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    # Retrieve current context (SchemaManifest)
    manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).all()
    
    context_parts = []
    for m in manifests:
        table_info = f"Table: {m.table_name}\n"
        if m.columns:
            cols_str = ", ".join([f"{c.get('name', 'unknown')} ({c.get('type', 'unknown')})" for c in m.columns])
            table_info += f"Columns: {cols_str}\n"
        if m.ai_notes:
            table_info += f"Notes: {m.ai_notes}\n"
        context_parts.append(table_info)
        
    context = "\n\n".join(context_parts)
    
    start_time = time.time()
    
    # LangGraph agent call
    try:
        data = await agent_service.run_query(str(datasource_id), uri, prompt, context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate query: {str(e)}")
        
    end_time = time.time()
    
    # Log query history
    history = QueryHistory(
        panel_id=None,
        prompt=prompt,
        generated_sql=data["sql"],
        execution_time_ms=int((end_time - start_time) * 1000),
        status="success",
        created_at=datetime.utcnow()
    )
    session.add(history)
    session.commit()
    
    return data

class ExecuteQueryRequest(BaseModel):
    sql: str
    date_range: Optional[Dict[str, str]] = None

@router.post("/execute")
async def execute_sql_query(
    datasource_id: uuid.UUID,
    request: ExecuteQueryRequest,
    session: Session = Depends(get_session)
):
    datasource = session.get(DataSource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    dialect = datasource.db_type if datasource.db_type else "postgresql"
    driver = "mysql+pymysql" if dialect == "mysql" else dialect
    uri = f"{driver}://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    import re
    final_sql = request.sql
    
    if request.date_range:
        start = request.date_range['start']
        end = request.date_range['end']
        
        def replace_date_filter(match):
            col_name = match.group(1).strip()
            return f"{col_name} >= '{start}' AND {col_name} <= '{end}'"
            
        final_sql = re.sub(r"\{\{date_filter:(.+?)\}\}", replace_date_filter, final_sql)
        # Handle fallback for exact match without column
        final_sql = final_sql.replace("{{date_filter}}", "TRUE")
    else:
        final_sql = re.sub(r"\{\{date_filter.*?\}\}", "TRUE", final_sql)
    
    try:
        engine = create_engine(uri)
        with engine.connect() as conn:
            result = conn.execute(text(final_sql))
            columns = result.keys()
            rows = [dict(zip(columns, row)) for row in result.fetchall()]
            
            # Serialize rows to handle datetime, UUIDs, etc.
            def serialize(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                import uuid
                if isinstance(obj, uuid.UUID):
                    return str(obj)
                from decimal import Decimal
                if isinstance(obj, Decimal):
                    return float(obj)
                return obj
            
            serialized_rows = []
            for row in rows:
                serialized_rows.append({k: serialize(v) for k, v in row.items()})
                
        return {"status": "success", "sql_executed": final_sql, "results": serialized_rows}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")
