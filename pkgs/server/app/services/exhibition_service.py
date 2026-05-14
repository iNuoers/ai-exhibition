"""Exhibition database service — CRUD operations for Exhibition model."""

from datetime import date
from typing import (
    Any,
    List,
    Optional,
)

from sqlmodel import (
    Session,
    col,
    select,
)

from app.core.logging import logger
from app.models.exhibition import Exhibition
from app.schemas.agent import ExhibitionCreate
from app.services.database import database_service
from app.services.scraper import scrape_exhibition


class ExhibitionService:
    """Service for Exhibition CRUD and scraping."""

    async def scrape_and_create(self, url: str, owner_id: int) -> Exhibition:
        """Scrape an exhibition page and store the result.

        Args:
            url: Exhibition page URL.
            owner_id: The user who initiated the scrape.

        Returns:
            Exhibition: The newly created exhibition record.
        """
        data = await scrape_exhibition(url)
        return await self._create_from_dict(data, owner_id)

    async def create(self, body: ExhibitionCreate, owner_id: int) -> Exhibition:
        """Create an exhibition from manual input.

        Args:
            body: Exhibition data from the client.
            owner_id: Owner user ID.

        Returns:
            Exhibition: The created record.
        """
        with Session(database_service.engine) as session:
            exhibition = Exhibition(
                **body.model_dump(exclude_none=True),
                owner_id=owner_id,
            )
            session.add(exhibition)
            session.commit()
            session.refresh(exhibition)
            logger.info("exhibition_created", exhibition_id=exhibition.id, name=exhibition.name)
            return exhibition

    async def get(self, exhibition_id: int) -> Optional[Exhibition]:
        """Get exhibition by ID."""
        with Session(database_service.engine) as session:
            return session.get(Exhibition, exhibition_id)

    async def list_by_owner(self, owner_id: int) -> List[Exhibition]:
        """List all exhibitions owned by a user."""
        with Session(database_service.engine) as session:
            statement = (
                select(Exhibition)
                .where(col(Exhibition.owner_id) == owner_id)
                .order_by(col(Exhibition.created_at).desc())
            )
            return list(session.exec(statement).all())

    async def delete(self, exhibition_id: int) -> bool:
        """Delete an exhibition by ID."""
        with Session(database_service.engine) as session:
            exhibition = session.get(Exhibition, exhibition_id)
            if not exhibition:
                return False
            session.delete(exhibition)
            session.commit()
            logger.info("exhibition_deleted", exhibition_id=exhibition_id)
            return True

    async def _create_from_dict(self, data: dict[str, Any], owner_id: int) -> Exhibition:
        """Create an Exhibition record from scraped dict data."""

        def _parse_date(val: Any) -> Optional[date]:
            if not val:
                return None
            if isinstance(val, date):
                return val
            try:
                return date.fromisoformat(str(val))
            except (ValueError, TypeError):
                return None

        with Session(database_service.engine) as session:
            exhibition = Exhibition(
                name=data.get("name", "Unnamed Exhibition"),
                start_date=_parse_date(data.get("start_date")),
                end_date=_parse_date(data.get("end_date")),
                venue=data.get("venue"),
                city=data.get("city"),
                address=data.get("address"),
                industry=data.get("industry"),
                ticket_type=data.get("ticket_type"),
                cycle=data.get("cycle"),
                visitor_count=data.get("visitor_count"),
                exhibitor_count=data.get("exhibitor_count"),
                exhibition_area=data.get("exhibition_area"),
                organizer=data.get("organizer"),
                description=data.get("description"),
                highlights=data.get("highlights"),
                exhibit_scope=data.get("exhibit_scope"),
                co_located_events=data.get("co_located_events"),
                source_url=data.get("source_url"),
                details=data,
                owner_id=owner_id,
            )
            session.add(exhibition)
            session.commit()
            session.refresh(exhibition)
            logger.info("exhibition_scraped_and_created", exhibition_id=exhibition.id, name=exhibition.name)
            return exhibition


exhibition_service = ExhibitionService()
