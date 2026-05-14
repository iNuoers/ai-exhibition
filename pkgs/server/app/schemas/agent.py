"""Schemas for Exhibition and AgentBot endpoints."""

from datetime import date
from typing import (
    Any,
    List,
    Optional,
)

from pydantic import (
    BaseModel,
    Field,
)

from app.schemas.base import BaseResponse


# ── Exhibition Schemas ──────────────────────────────────────────────


class ExhibitionCreate(BaseModel):
    """Manual exhibition creation payload."""

    name: str = Field(..., min_length=1, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    ticket_type: Optional[str] = None
    cycle: Optional[str] = None
    visitor_count: Optional[str] = None
    exhibitor_count: Optional[str] = None
    exhibition_area: Optional[str] = None
    organizer: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    exhibit_scope: Optional[dict[str, Any]] = None
    co_located_events: Optional[List[str]] = None
    source_url: Optional[str] = None


class ExhibitionResponse(BaseResponse):
    """Exhibition detail returned to clients."""

    id: int
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    ticket_type: Optional[str] = None
    cycle: Optional[str] = None
    visitor_count: Optional[str] = None
    exhibitor_count: Optional[str] = None
    exhibition_area: Optional[str] = None
    organizer: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    exhibit_scope: Optional[dict[str, Any]] = None
    co_located_events: Optional[List[str]] = None
    source_url: Optional[str] = None
    owner_id: int


class ExhibitionScrapeRequest(BaseModel):
    """Request to scrape an exhibition from URL."""

    url: str = Field(..., description="URL of the exhibition page to scrape")


# ── AgentBot Schemas ────────────────────────────────────────────────


class AgentBotCreate(BaseModel):
    """Create an agent bot manually."""

    name: str = Field(..., min_length=1, max_length=100)
    exhibition_id: Optional[int] = None
    welcome_message: str = Field(default="")
    sample_questions: Optional[List[str]] = None
    system_prompt: str = Field(default="")
    custom_knowledge: Optional[dict[str, Any]] = None
    contact_info: Optional[dict[str, Any]] = None
    config: Optional[dict[str, Any]] = None
    daily_limit: int = Field(default=100, ge=1, le=10000)
    session_turn_limit: int = Field(default=20, ge=1, le=100)


class AgentBotUpdate(BaseModel):
    """Partial update for an agent bot."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    welcome_message: Optional[str] = None
    sample_questions: Optional[List[str]] = None
    system_prompt: Optional[str] = None
    custom_knowledge: Optional[dict[str, Any]] = None
    contact_info: Optional[dict[str, Any]] = None
    config: Optional[dict[str, Any]] = None
    daily_limit: Optional[int] = Field(default=None, ge=1, le=10000)
    session_turn_limit: Optional[int] = Field(default=None, ge=1, le=100)


class AgentBotResponse(BaseResponse):
    """Agent bot detail returned to clients."""

    id: int
    owner_id: int
    exhibition_id: Optional[int] = None
    name: str
    welcome_message: str
    sample_questions: Optional[List[str]] = None
    system_prompt: str
    custom_knowledge: Optional[dict[str, Any]] = None
    contact_info: Optional[dict[str, Any]] = None
    config: Optional[dict[str, Any]] = None
    share_token: str
    is_published: bool
    daily_limit: int
    session_turn_limit: int
    total_conversations: int


class AgentBotGenerateRequest(BaseModel):
    """Request body for AI-generated agent creation."""

    exhibition_id: int = Field(..., description="Exhibition ID to generate agent for")
    language: str = Field(default="zh", description="Language for generated content (zh / en)")


# ── Public (Visitor) Schemas ────────────────────────────────────────


class PublicAgentInfo(BaseResponse):
    """Information returned to anonymous visitors."""

    agent_name: str
    exhibition_name: Optional[str] = None
    welcome_message: str
    sample_questions: Optional[List[str]] = None
    contact_info: Optional[dict[str, Any]] = None


class PublicChatRequest(BaseModel):
    """Visitor chat request — no auth required."""

    message: str = Field(..., min_length=1, max_length=3000)
    visitor_session_id: Optional[str] = Field(
        default=None,
        description="Client-generated session ID for conversation continuity",
    )
