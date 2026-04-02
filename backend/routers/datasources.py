from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Optional, List, Any
from sqlmodel import Session, select
from database import get_session
from models.domain import DataSource, SchemaManifest, DataSourceCreate
from services.agent_service import agent_service
from services.mcp_service import mcp_service # for raw tool access
from services.database_service import database_service
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/test-connection")
async def test_connection(config: DataSourceCreate):
    result = database_service.test_connection(config.dict())
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result
    result = database_service.test_connection(config.dict())
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/")
async def create_datasource(payload: DataSourceCreate, session: Session = Depends(get_session)):
    # Map DataSourceCreate to DataSource (database model)
    datasource_data = payload.dict()
    password = datasource_data.pop("password")
    
    datasource = DataSource(
        **datasource_data,
        encrypted_password=password # In real app, encrypt this
    )
    
    session.add(datasource)
    session.commit()
    session.refresh(datasource)
    return datasource

@router.get("/")
async def list_datasources(session: Session = Depends(get_session)):
    return session.exec(select(DataSource)).all()

@router.delete("/{datasource_id}")
async def delete_datasource(datasource_id: uuid.UUID, session: Session = Depends(get_session)):
    datasource = session.get(DataSource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
    # Cascade-delete related schema manifests
    manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).all()
    for m in manifests:
        session.delete(m)
    session.delete(datasource)
    session.commit()
    return {"status": "deleted", "id": str(datasource_id)}

@router.post("/{datasource_id}/scan")
async def scan_datasource(datasource_id: uuid.UUID, session: Session = Depends(get_session)):
    datasource = session.get(DataSource, datasource_id)
    if not datasource:
        raise HTTPException(status_code=404, detail="Data source not found")
        
    # Build connection URI: postgresql://user:pass@host:port/database
    uri = f"postgresql://{datasource.user}:{datasource.encrypted_password}@{datasource.host}:{datasource.port}/{datasource.database}"
    
    # Run the agentic scan
    raw_scan_result = await agent_service.scan_schema(str(datasource_id), uri)
    
    import json
    try:
        data = json.loads(raw_scan_result)
        # Clean current manifests for this datasource
        old_manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).all()
        for m in old_manifests:
            session.delete(m)
            
        for table in data:
            manifest = SchemaManifest(
                data_source_id=datasource_id,
                table_name=table.get("table_name", "unknown"),
                columns=table.get("columns", []),
                sample_rows=table.get("sample_rows", []),
                ai_notes=None,
                last_scanned_at=datetime.utcnow()
            )
            session.add(manifest)
            
        session.commit()
        return {"status": "success", "message": f"Synced {len(data)} tables"}
        
    except json.JSONDecodeError:
        # Fallback if the AI gives unstructured resp
        manifest = SchemaManifest(
            data_source_id=datasource_id,
            table_name="full_schema_raw",
            columns=[],
            sample_rows=[],
            ai_notes=raw_scan_result,
            last_scanned_at=datetime.utcnow()
        )
        session.add(manifest)
        session.commit()
        return {"status": "partial_success", "message": "Stored raw notes, could not parse structure."}
