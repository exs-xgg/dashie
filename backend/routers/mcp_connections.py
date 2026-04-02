from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.domain import MCPConnection
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/")
async def list_mcp_connections(session: Session = Depends(get_session)):
    return session.exec(select(MCPConnection)).all()

@router.post("/")
async def create_mcp_connection(connection: MCPConnection, session: Session = Depends(get_session)):
    session.add(connection)
    session.commit()
    session.refresh(connection)
    return connection

@router.patch("/{connection_id}")
async def update_mcp_connection(
    connection_id: uuid.UUID,
    connection_data: dict,
    session: Session = Depends(get_session)
):
    connection = session.get(MCPConnection, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="MCP Connection not found")
        
    for key, value in connection_data.items():
        if hasattr(connection, key):
            setattr(connection, key, value)
            
    connection.updated_at = datetime.utcnow()
    session.add(connection)
    session.commit()
    session.refresh(connection)
    return connection

@router.delete("/{connection_id}")
async def delete_mcp_connection(
    connection_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    connection = session.get(MCPConnection, connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="MCP Connection not found")
        
    session.delete(connection)
    session.commit()
    return {"status": "deleted"}
