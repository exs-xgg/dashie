from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.domain import Dashboard, DashboardPanel
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/")
async def list_dashboards(session: Session = Depends(get_session)):
    return session.exec(select(Dashboard)).all()

@router.post("/")
async def create_dashboard(dashboard: Dashboard, session: Session = Depends(get_session)):
    session.add(dashboard)
    session.commit()
    session.refresh(dashboard)
    return dashboard

@router.get("/{dashboard_id}/panels")
async def list_panels(dashboard_id: uuid.UUID, session: Session = Depends(get_session)):
    return session.exec(select(DashboardPanel).where(DashboardPanel.dashboard_id == dashboard_id)).all()

@router.post("/{dashboard_id}/panels")
async def create_panel(
    dashboard_id: uuid.UUID,
    panel: DashboardPanel,
    session: Session = Depends(get_session)
):
    panel.dashboard_id = dashboard_id
    session.add(panel)
    session.commit()
    session.refresh(panel)
    return panel

@router.patch("/{dashboard_id}/panels/{panel_id}")
async def update_panel(
    dashboard_id: uuid.UUID,
    panel_id: uuid.UUID,
    panel_data: dict,
    session: Session = Depends(get_session)
):
    panel = session.get(DashboardPanel, panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail="Panel not found")
        
    for key, value in panel_data.items():
        setattr(panel, key, value)
        
    panel.updated_at = datetime.utcnow()
    session.add(panel)
    session.commit()
    session.refresh(panel)
    return panel

@router.delete("/{dashboard_id}/panels/{panel_id}")
async def delete_panel(
    dashboard_id: uuid.UUID,
    panel_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    panel = session.get(DashboardPanel, panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail="Panel not found")
        
    session.delete(panel)
    session.commit()
    return {"status": "deleted"}
