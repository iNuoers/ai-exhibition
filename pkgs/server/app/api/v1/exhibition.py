"""Exhibition CRUD API endpoints."""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)

from app.api.v1.auth import get_current_user
from app.core.limiter import limiter
from app.core.logging import logger
from app.models.exhibition import Exhibition
from app.models.user import User
from app.schemas.agent import (
    ExhibitionCreate,
    ExhibitionResponse,
    ExhibitionScrapeRequest,
)
from app.services.exhibition_service import exhibition_service

router = APIRouter()


@router.post("/scrape", response_model=ExhibitionResponse)
@limiter.limit("10 per hour")
async def scrape_exhibition(
    request: Request,
    body: ExhibitionScrapeRequest,
    user: User = Depends(get_current_user),
):
    """Scrape an exhibition page and store the extracted data.

    Args:
        request: FastAPI request for rate limiting.
        body: Contains the URL to scrape.
        user: Authenticated user.

    Returns:
        ExhibitionResponse: The newly created exhibition.
    """
    try:
        logger.info("scrape_exhibition_requested", url=body.url, user_id=user.id)
        exhibition = await exhibition_service.scrape_and_create(body.url, user.id)
        return _to_response(exhibition)
    except Exception as e:
        logger.exception("scrape_exhibition_failed", url=body.url, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to scrape exhibition: {str(e)}")


@router.post("", response_model=ExhibitionResponse)
@limiter.limit("20 per hour")
async def create_exhibition(
    request: Request,
    body: ExhibitionCreate,
    user: User = Depends(get_current_user),
):
    """Create an exhibition manually.

    Args:
        request: FastAPI request for rate limiting.
        body: Exhibition data.
        user: Authenticated user.

    Returns:
        ExhibitionResponse: The created exhibition.
    """
    try:
        exhibition = await exhibition_service.create(body, user.id)
        return _to_response(exhibition)
    except Exception as e:
        logger.exception("create_exhibition_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[ExhibitionResponse])
@limiter.limit("30 per minute")
async def list_exhibitions(
    request: Request,
    user: User = Depends(get_current_user),
):
    """List all exhibitions owned by the current user.

    Args:
        request: FastAPI request for rate limiting.
        user: Authenticated user.

    Returns:
        List[ExhibitionResponse]: User's exhibitions.
    """
    exhibitions = await exhibition_service.list_by_owner(user.id)
    return [_to_response(e) for e in exhibitions]


@router.get("/{exhibition_id}", response_model=ExhibitionResponse)
@limiter.limit("30 per minute")
async def get_exhibition(
    request: Request,
    exhibition_id: int,
    user: User = Depends(get_current_user),
):
    """Get a single exhibition by ID.

    Args:
        request: FastAPI request for rate limiting.
        exhibition_id: The exhibition ID.
        user: Authenticated user.

    Returns:
        ExhibitionResponse: The exhibition.
    """
    exhibition = await exhibition_service.get(exhibition_id)
    if not exhibition or exhibition.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    return _to_response(exhibition)


@router.delete("/{exhibition_id}")
@limiter.limit("10 per hour")
async def delete_exhibition(
    request: Request,
    exhibition_id: int,
    user: User = Depends(get_current_user),
):
    """Delete an exhibition.

    Args:
        request: FastAPI request for rate limiting.
        exhibition_id: The exhibition ID.
        user: Authenticated user.

    Returns:
        dict: Success message.
    """
    exhibition = await exhibition_service.get(exhibition_id)
    if not exhibition or exhibition.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Exhibition not found")
    await exhibition_service.delete(exhibition_id)
    return {"message": "Exhibition deleted"}


def _to_response(exhibition: Exhibition) -> ExhibitionResponse:
    """Convert an Exhibition model to response schema."""
    return ExhibitionResponse(
        id=exhibition.id,
        name=exhibition.name,
        start_date=exhibition.start_date,
        end_date=exhibition.end_date,
        venue=exhibition.venue,
        city=exhibition.city,
        address=exhibition.address,
        industry=exhibition.industry,
        ticket_type=exhibition.ticket_type,
        cycle=exhibition.cycle,
        visitor_count=exhibition.visitor_count,
        exhibitor_count=exhibition.exhibitor_count,
        exhibition_area=exhibition.exhibition_area,
        organizer=exhibition.organizer,
        description=exhibition.description,
        highlights=exhibition.highlights,
        exhibit_scope=exhibition.exhibit_scope,
        co_located_events=exhibition.co_located_events,
        source_url=exhibition.source_url,
        owner_id=exhibition.owner_id,
    )
