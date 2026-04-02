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
        
    config = {
        "db_type": datasource.db_type,
        "user": datasource.user,
        "password": datasource.encrypted_password,
        "host": datasource.host,
        "port": datasource.port,
        "database": datasource.database
    }
    
    try:
        # Run standard DB schema introspection
        data = database_service.introspect_schema(config)
        
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
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Fallback if there's a problem during sync
        raw_error = str(e)
        manifest = SchemaManifest(
            data_source_id=datasource_id,
            table_name="sync_error",
            columns=[],
            sample_rows=[],
            ai_notes=f"Failed to sync: {raw_error}",
            last_scanned_at=datetime.utcnow()
        )
        session.add(manifest)
        session.commit()
        return {"status": "error", "message": f"Failed to sync schema: {raw_error}"}

@router.get("/{datasource_id}/schema")
async def get_datasource_schema(datasource_id: uuid.UUID, session: Session = Depends(get_session)):
    manifests = session.exec(select(SchemaManifest).where(SchemaManifest.data_source_id == datasource_id)).all()
    return manifests
