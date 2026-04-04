from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.domain import DataSource, SchemaManifest, QueryHistory, DashboardPanel
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
    chart_type: Optional[str] = None,
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
    
    try:
        data = await agent_service.run_query(str(datasource_id), uri, prompt, context, chart_type)
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

@router.get("/suggestions/{datasource_id}")
async def get_query_suggestions(
    datasource_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    datasource = session.get(DataSource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    dialect = datasource.db_type if datasource.db_type else "postgresql"
    driver = "mysql+pymysql" if dialect == "mysql" else dialect
    uri = f"{driver}://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    # Retrieve context
    manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).all()
    context = "\n\n".join([
        f"Table: {m.table_name}\nColumns: " + ", ".join([f"{c.get('name')} ({c.get('type')})" for c in m.columns])
        for m in manifests
    ])
    
    try:
        suggestions = await agent_service.suggest_queries(str(datasource_id), uri, context)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

class FixQueryRequest(BaseModel):
    panel_id: uuid.UUID
    error_message: str

@router.post("/fix")
async def fix_sql_query(
    request: FixQueryRequest,
    session: Session = Depends(get_session)
):
    panel = session.get(DashboardPanel, request.panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail="Panel not found")

    datasource = session.get(DataSource, panel.data_source_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")

    dialect = datasource.db_type if datasource.db_type else "postgresql"
    driver = "mysql+pymysql" if dialect == "mysql" else dialect
    uri = f"{driver}://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"

    # Retrieve context
    manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == panel.data_source_id)).all()
    context = "\n\n".join([
        f"Table: {m.table_name}\nColumns: " + ", ".join([f"{c.get('name')} ({c.get('type')})" for c in m.columns])
        for m in manifests
    ])

    try:
        data = await agent_service.fix_query(str(panel.data_source_id), uri, panel.generated_sql, request.error_message, context)
        
        # Update panel
        panel.generated_sql = data["sql"]
        panel.title = data["title"]
        panel.chart_type = data["chart_type"]
        panel.chart_config = {
            "xaxis_column": data["xaxis_column"],
            "yaxis_columns": data["yaxis_columns"]
        }
        panel.updated_at = datetime.utcnow()
        session.add(panel)
        session.commit()
        session.refresh(panel)
        
        return panel
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fix query: {str(e)}")

class ExecuteQueryRequest(BaseModel):
    sql: str
    date_range: Optional[Dict[str, str]] = None
    grouping: Optional[str] = None

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
    
    # 1. Handle Date Filter Replacement
    if request.date_range:
        start = request.date_range['start']
        end = request.date_range['end']
        
        def replace_date_filter(match):
            col_name = match.group(1).strip()
            return f"{col_name} >= '{start}' AND {col_name} <= '{end}'"
            
        final_sql = re.sub(r"\{\{date_filter:(.+?)\}\}", replace_date_filter, final_sql)
        final_sql = final_sql.replace("{{date_filter}}", "TRUE")
    else:
        final_sql = re.sub(r"\{\{date_filter.*?\}\}", "TRUE", final_sql)

    # 2. Handle Date Grouping Replacement
    group = request.grouping or "day"
    
    def replace_date_group(match):
        col_name = match.group(1).strip()
        if dialect == "postgresql":
            # Postgres DATE_TRUNC
            return f"DATE_TRUNC('{group}', {col_name})"
        elif dialect == "mysql":
            # MySQL DATE_FORMAT fallbacks
            if group == "day":
                return f"DATE_FORMAT({col_name}, '%Y-%m-%d')"
            elif group == "week":
                return f"DATE_FORMAT({col_name}, '%Y-%u')"
            elif group == "month":
                return f"DATE_FORMAT({col_name}, '%Y-%m-01')"
            elif group == "quarter":
                return f"CONCAT(YEAR({col_name}), '-Q', QUARTER({col_name}))"
            elif group == "year":
                return f"DATE_FORMAT({col_name}, '%Y-01-01')"
            return col_name
        return col_name

    final_sql = re.sub(r"\{\{date_group:(.+?)\}\}", replace_date_group, final_sql)
    
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
