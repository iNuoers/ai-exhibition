"""AgentBot model for user-created AI agent configurations."""

import secrets
from typing import (
    TYPE_CHECKING,
    Any,
    List,
    Optional,
)

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import (
    Field,
    Relationship,
)

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.exhibition import Exhibition


class AgentBot(BaseModel, table=True):
    """AgentBot model — each record represents a user-created intelligent agent.

    Attributes:
        id: Auto-increment primary key.
        owner_id: The user who owns this agent.
        exhibition_id: Optional linked exhibition.
        name: Display name for the agent.
        welcome_message: Greeting shown to visitors.
        sample_questions: Suggested questions for visitors (JSONB list of strings).
        system_prompt: The system prompt used for the LLM.
        custom_knowledge: User-provided Q&A pairs, documents, etc. (JSONB).
        contact_info: Fallback contact for human handoff (JSONB).
        config: Agent configuration — model, temperature, etc. (JSONB).
        share_token: Unique short token for the public share link.
        is_published: Whether the agent is publicly accessible.
        daily_limit: Maximum conversations per day (cost control).
        session_turn_limit: Maximum turns per visitor session.
        total_conversations: Lifetime conversation counter.
        exhibition: Relationship back to Exhibition.
    """

    id: int = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    exhibition_id: Optional[int] = Field(default=None, foreign_key="exhibition.id", index=True)

    name: str = Field(index=True)
    welcome_message: str = Field(
        default="",
    )
    sample_questions: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    system_prompt: str = Field(default="")
    custom_knowledge: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    contact_info: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    config: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))

    share_token: str = Field(default_factory=lambda: secrets.token_urlsafe(12), unique=True, index=True)
    is_published: bool = Field(default=False)

    daily_limit: int = Field(default=100)
    session_turn_limit: int = Field(default=20)
    total_conversations: int = Field(default=0)

    exhibition: Optional["Exhibition"] = Relationship(back_populates="agent_bots")
