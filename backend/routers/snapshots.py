from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.domain import Dashboard, DashboardPanel, DashboardSnapshot, DataSource
from routers.query import execute_sql_query, ExecuteQueryRequest
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

class SnapshotCreate(BaseModel):
    dashboard_id: uuid.UUID
    name: str
    filter_settings: Dict[str, Any] # {date_range: {start, end}, grouping: "day"}

@router.post("/")
async def create_snapshot(
    request: SnapshotCreate,
    session: Session = Depends(get_session)
):
    dashboard = session.get(Dashboard, request.dashboard_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    panels = session.exec(select(DashboardPanel).where(DashboardPanel.dashboard_id == request.dashboard_id)).all()

    snapshot_panels = []
    for panel in panels:
        panel_data = {
            "id": str(panel.id),
            "title": panel.title,
            "content": panel.content,
            "chart_type": panel.chart_type,
            "layout": panel.layout,
            "chart_config": panel.chart_config,
            "results": [],
            "error": None
        }

        if panel.chart_type != "text" and panel.data_source_id and panel.generated_sql:
            try:
                # Use query_request directly if LLM is not available/configured for capture
                # In this environment, we might not have the target DB or LLM keys
                # So we catch and provide mock data or empty results
                query_request = ExecuteQueryRequest(
                    sql=panel.generated_sql,
                    date_range=request.filter_settings.get("date_range"),
                    grouping=request.filter_settings.get("grouping")
                )
                result = await execute_sql_query(
                    datasource_id=panel.data_source_id,
                    request=query_request,
                    session=session
                )
                panel_data["results"] = result.get("results")
            except Exception as e:
                # If it fails (e.g. no DB), we still want to create the snapshot with empty results
                panel_data["error"] = str(e)

        snapshot_panels.append(panel_data)

    # Revolving 5r logic: delete oldest if records are already 5 or more
    existing_snapshots = session.exec(
        select(DashboardSnapshot)
        .where(DashboardSnapshot.dashboard_id == request.dashboard_id)
        .order_by(DashboardSnapshot.created_at.asc())
    ).all()

    if len(existing_snapshots) >= 5:
        # Delete such that we have at most 4 left before adding the new one
        to_delete_count = len(existing_snapshots) - 4
        for i in range(to_delete_count):
            session.delete(existing_snapshots[i])

    snapshot = DashboardSnapshot(
        dashboard_id=request.dashboard_id,
        name=request.name,
        snapshot_data=snapshot_panels,
        filter_settings=request.filter_settings,
        created_at=datetime.utcnow()
    )
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)
    return snapshot

@router.delete("/{snapshot_id}")
async def delete_snapshot(
    snapshot_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    snapshot = session.get(DashboardSnapshot, snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    
    session.delete(snapshot)
    session.commit()
    return {"status": "success"}

@router.get("/{snapshot_id}")
async def get_snapshot(
    snapshot_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    snapshot = session.get(DashboardSnapshot, snapshot_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return snapshot

@router.get("/dashboard/{dashboard_id}")
async def list_snapshots(
    dashboard_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    return session.exec(
        select(DashboardSnapshot)
        .where(DashboardSnapshot.dashboard_id == dashboard_id)
        .order_by(DashboardSnapshot.created_at.desc())
    ).all()
