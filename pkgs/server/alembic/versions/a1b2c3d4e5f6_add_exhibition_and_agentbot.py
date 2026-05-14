"""Add exhibition and agentbot tables.

Revision ID: a1b2c3d4e5f6
Revises: b8f135fc0dfa
Create Date: 2026-05-12 16:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel  # noqa: F401
from sqlalchemy.dialects.postgresql import JSONB

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b8f135fc0dfa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Exhibition table
    op.create_table(
        'exhibition',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('venue', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('city', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('industry', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('ticket_type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('cycle', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('visitor_count', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('exhibitor_count', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('exhibition_area', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('organizer', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('highlights', JSONB(), nullable=True),
        sa.Column('exhibit_scope', JSONB(), nullable=True),
        sa.Column('co_located_events', JSONB(), nullable=True),
        sa.Column('source_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('details', JSONB(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_exhibition_name'), 'exhibition', ['name'], unique=False)
    op.create_index(op.f('ix_exhibition_owner_id'), 'exhibition', ['owner_id'], unique=False)

    # AgentBot table
    op.create_table(
        'agentbot',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('exhibition_id', sa.Integer(), nullable=True),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('welcome_message', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('sample_questions', JSONB(), nullable=True),
        sa.Column('system_prompt', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('custom_knowledge', JSONB(), nullable=True),
        sa.Column('contact_info', JSONB(), nullable=True),
        sa.Column('config', JSONB(), nullable=True),
        sa.Column('share_token', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('daily_limit', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('session_turn_limit', sa.Integer(), nullable=False, server_default='20'),
        sa.Column('total_conversations', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id']),
        sa.ForeignKeyConstraint(['exhibition_id'], ['exhibition.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_agentbot_name'), 'agentbot', ['name'], unique=False)
    op.create_index(op.f('ix_agentbot_owner_id'), 'agentbot', ['owner_id'], unique=False)
    op.create_index(op.f('ix_agentbot_exhibition_id'), 'agentbot', ['exhibition_id'], unique=False)
    op.create_index(op.f('ix_agentbot_share_token'), 'agentbot', ['share_token'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_agentbot_share_token'), table_name='agentbot')
    op.drop_index(op.f('ix_agentbot_exhibition_id'), table_name='agentbot')
    op.drop_index(op.f('ix_agentbot_owner_id'), table_name='agentbot')
    op.drop_index(op.f('ix_agentbot_name'), table_name='agentbot')
    op.drop_table('agentbot')
    op.drop_index(op.f('ix_exhibition_owner_id'), table_name='exhibition')
    op.drop_index(op.f('ix_exhibition_name'), table_name='exhibition')
    op.drop_table('exhibition')
