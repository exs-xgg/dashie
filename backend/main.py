from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import datasources, query, dashboards, mcp_connections, snapshots
from database import create_db_and_tables
from config import get_settings

settings = get_settings()

app = FastAPI(title="dashie", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(datasources.router, prefix="/api/datasources", tags=["Data Sources"])
app.include_router(query.router, prefix="/api/query", tags=["Query"])
app.include_router(dashboards.router, prefix="/api/dashboards", tags=["Dashboards"])
app.include_router(mcp_connections.router, prefix="/api/mcp-connections", tags=["MCP Connections"])
app.include_router(snapshots.router, prefix="/api/snapshots", tags=["Snapshots"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
