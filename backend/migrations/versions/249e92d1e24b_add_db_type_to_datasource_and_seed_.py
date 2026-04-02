"""add db_type to datasource and seed sample connection

Revision ID: 249e92d1e24b
Revises: 42a4bae012e1
Create Date: 2026-04-02 10:42:44.234604

"""
import uuid
from datetime import datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '249e92d1e24b'
down_revision: Union[str, Sequence[str], None] = '42a4bae012e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and seed sample connection."""
    # Add column
    op.add_column('datasource', sa.Column('db_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='postgresql'))
    
    # Seed sample connection
    ds_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    # Use bind to execute SQL safely
    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            INSERT INTO datasource (id, name, host, port, database, \"user\", encrypted_password, db_type, created_at, updated_at)
            VALUES (:id, :name, :host, :port, :database, :user, :password, :db_type, :created_at, :updated_at)
            """
        ),
        {
            "id": ds_id,
            "name": "Sample Sales DB",
            "host": "localhost",
            "port": 5432,
            "database": "sample_db",
            "user": "postgres",
            "password": "changeme",
            "db_type": "postgresql",
            "created_at": now,
            "updated_at": now,
        }
    )


def downgrade() -> None:
    """Downgrade schema and remove sample connection."""
    # Remove sample connection
    connection = op.get_bind()
    connection.execute(
        sa.text("DELETE FROM datasource WHERE name = 'Sample Sales DB' AND database = 'sample_db'")
    )
    
    # Drop column
    op.drop_column('datasource', 'db_type')
