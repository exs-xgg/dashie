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
        
    uri = f"postgresql://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    # Retrieve current context (SchemaManifest)
    manifest = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).first()
    context = manifest.ai_notes if manifest else ""
    
    start_time = time.time()
    
    # LangGraph agent call
    raw_result = await agent_service.run_query(str(datasource_id), uri, prompt, context)
    
    try:
        # Gemini often encloses JSON in markdown blocks
        clean_json = raw_result.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].strip()
            
        data = json.loads(clean_json)
    except Exception as e:
        # Fallback if parsing fails
        data = {
            "sql": raw_result,
            "title": "Generated Query",
            "chart_type": "table"
        }
        
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
        
    uri = f"postgresql://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    date_filter = ""
    if request.date_range:
        date_filter = f"created_at >= '{request.date_range['start']}' AND created_at <= '{request.date_range['end']}'"
    
    final_sql = request.sql.replace("{{date_filter}}", date_filter if date_filter else "TRUE")
    
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
