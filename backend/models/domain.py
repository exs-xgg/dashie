from typing import List, Optional, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from datetime import datetime
import uuid

class DataSourceBase(SQLModel):
    name: str = Field(index=True)
    host: str
    port: int = Field(default=5432)
    database: str
    user: str
    db_type: str = Field(default="postgresql") # postgresql, mysql, mongodb

class DataSourceCreate(DataSourceBase):
    password: str

class DataSource(DataSourceBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    encrypted_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to manifests
    manifests: List["SchemaManifest"] = Relationship(back_populates="data_source")

class SchemaManifest(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    data_source_id: uuid.UUID = Field(foreign_key="datasource.id")
    table_name: str
    columns: Any = Field(sa_column=Column(JSON)) # JSON List of {name, type, is_primary, is_foreign}
    sample_rows: Optional[Any] = Field(default=None, sa_column=Column(JSON))
    ai_notes: Optional[str] = None
    last_scanned_at: datetime = Field(default_factory=datetime.utcnow)

    data_source: DataSource = Relationship(back_populates="manifests")

class Dashboard(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to panels
    panels: List["DashboardPanel"] = Relationship(back_populates="dashboard")

class DashboardPanel(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    dashboard_id: uuid.UUID = Field(foreign_key="dashboard.id")
    data_source_id: uuid.UUID = Field(foreign_key="datasource.id")
    title: str
    natural_language_query: str
    generated_sql: str
    chart_type: str # bar, line, table
    layout: Any = Field(sa_column=Column(JSON)) # {x, y, w, h}
    chart_config: Optional[Any] = Field(default=None, sa_column=Column(JSON)) # x-axis, y-axis config
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    dashboard: Dashboard = Relationship(back_populates="panels")

class QueryHistory(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    panel_id: Optional[uuid.UUID] = Field(default=None, foreign_key="dashboardpanel.id")
    prompt: Optional[str] = None
    generated_sql: str
    execution_time_ms: int
    status: str # "success", "error"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MCPConnection(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    server_url: str
    api_key: Optional[str] = None # Should be encrypted in production
    description: Optional[str] = None
    status: str = Field(default="disconnected") # connected, disconnected, error
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
