"""add custom_css to dashboard

Revision ID: 8453fa35653a
Revises: 8f96b42e1980
Create Date: 2026-04-02 15:44:51.890405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8453fa35653a'
down_revision: Union[str, Sequence[str], None] = '8f96b42e1980'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('dashboard', sa.Column('custom_css', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('dashboard', 'custom_css')
