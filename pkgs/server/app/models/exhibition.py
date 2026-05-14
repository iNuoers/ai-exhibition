"""Exhibition model for storing exhibition/trade show information."""

from datetime import date
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
    from app.models.agent_bot import AgentBot


class Exhibition(BaseModel, table=True):
    """Exhibition model for storing trade show / exhibition information.

    Attributes:
        id: Auto-increment primary key.
        name: Exhibition name.
        start_date: Exhibition start date.
        end_date: Exhibition end date.
        venue: Venue name.
        city: City where the exhibition is held.
        address: Full address of the venue.
        industry: Industry category.
        ticket_type: Ticket type (e.g. free, paid).
        cycle: How often the exhibition is held (e.g. annually).
        visitor_count: Expected visitor count.
        exhibitor_count: Number of exhibitors.
        exhibition_area: Exhibition area in square metres.
        organizer: Organizer(s) of the exhibition.
        description: Short description / introduction.
        highlights: Key highlights (JSONB list of strings).
        exhibit_scope: Exhibit categories and products (JSONB).
        co_located_events: Co-located / concurrent events (JSONB list).
        source_url: The URL the data was scraped from.
        details: Full raw structured data as scraped (JSONB fallback).
        owner_id: The user who created this exhibition record.
        agent_bots: Relationship to agent bots linked to this exhibition.
    """

    id: int = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    venue: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)
    industry: Optional[str] = Field(default=None)
    ticket_type: Optional[str] = Field(default=None)
    cycle: Optional[str] = Field(default=None)
    visitor_count: Optional[str] = Field(default=None)
    exhibitor_count: Optional[str] = Field(default=None)
    exhibition_area: Optional[str] = Field(default=None)
    organizer: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    highlights: Optional[List[Any]] = Field(default=None, sa_column=Column(JSONB))
    exhibit_scope: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    co_located_events: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    source_url: Optional[str] = Field(default=None)
    details: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    owner_id: int = Field(foreign_key="user.id", index=True)

    agent_bots: List["AgentBot"] = Relationship(back_populates="exhibition")


# Avoid circular imports
from app.models.agent_bot import AgentBot  # noqa: E402
