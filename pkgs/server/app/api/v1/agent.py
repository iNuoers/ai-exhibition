"""AgentBot CRUD + AI generation API endpoints."""

from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)

from app.api.v1.auth import get_current_user
from app.core.langgraph.agent_factory import ExhibitionAgentRunner
from app.core.limiter import limiter
from app.core.logging import logger
from app.models.agent_bot import AgentBot
from app.models.user import User
from app.schemas.agent import (
    AgentBotCreate,
    AgentBotGenerateRequest,
    AgentBotResponse,
    AgentBotUpdate,
)
from app.services.agent_service import agent_service
from app.services.exhibition_service import exhibition_service

router = APIRouter()


@router.post("", response_model=AgentBotResponse)
@limiter.limit("20 per hour")
async def create_agent(
    request: Request,
    body: AgentBotCreate,
    user: User = Depends(get_current_user),
):
    """Create a new agent bot manually.

    Args:
        request: FastAPI request for rate limiting.
        body: Agent bot data.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The created agent bot.
    """
    try:
        bot = await agent_service.create(body, user.id)
        return _to_response(bot)
    except Exception as e:
        logger.exception("create_agent_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate", response_model=AgentBotResponse)
@limiter.limit("10 per hour")
async def generate_agent(
    request: Request,
    body: AgentBotGenerateRequest,
    user: User = Depends(get_current_user),
):
    """AI-generate an agent bot from exhibition data.

    Args:
        request: FastAPI request for rate limiting.
        body: Contains exhibition_id and language.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The AI-generated agent bot.
    """
    try:
        exhibition = await exhibition_service.get(body.exhibition_id)
        if not exhibition or exhibition.owner_id != user.id:
            raise HTTPException(status_code=404, detail="Exhibition not found")

        bot = await agent_service.generate_from_exhibition(exhibition, user.id, body.language)
        return _to_response(bot)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate_agent_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[AgentBotResponse])
@limiter.limit("30 per minute")
async def list_agents(
    request: Request,
    user: User = Depends(get_current_user),
):
    """List all agent bots owned by the current user.

    Args:
        request: FastAPI request for rate limiting.
        user: Authenticated user.

    Returns:
        List[AgentBotResponse]: User's agent bots.
    """
    bots = await agent_service.list_by_owner(user.id)
    return [_to_response(b) for b in bots]


@router.get("/{agent_id}", response_model=AgentBotResponse)
@limiter.limit("30 per minute")
async def get_agent(
    request: Request,
    agent_id: int,
    user: User = Depends(get_current_user),
):
    """Get a single agent bot.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The agent bot.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    return _to_response(bot)


@router.patch("/{agent_id}", response_model=AgentBotResponse)
@limiter.limit("20 per hour")
async def update_agent(
    request: Request,
    agent_id: int,
    body: AgentBotUpdate,
    user: User = Depends(get_current_user),
):
    """Update an agent bot.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        body: Fields to update.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The updated agent bot.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    updated = await agent_service.update(agent_id, body)
    return _to_response(updated)


@router.post("/{agent_id}/publish", response_model=AgentBotResponse)
@limiter.limit("10 per hour")
async def publish_agent(
    request: Request,
    agent_id: int,
    user: User = Depends(get_current_user),
):
    """Publish an agent bot — makes it publicly accessible via share link.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The published agent bot with share_token.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    published = await agent_service.publish(agent_id)
    return _to_response(published)


@router.post("/{agent_id}/unpublish", response_model=AgentBotResponse)
@limiter.limit("10 per hour")
async def unpublish_agent(
    request: Request,
    agent_id: int,
    user: User = Depends(get_current_user),
):
    """Unpublish an agent bot.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        user: Authenticated user.

    Returns:
        AgentBotResponse: The unpublished agent bot.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    unpublished = await agent_service.unpublish(agent_id)
    return _to_response(unpublished)


@router.delete("/{agent_id}")
@limiter.limit("10 per hour")
async def delete_agent(
    request: Request,
    agent_id: int,
    user: User = Depends(get_current_user),
):
    """Delete an agent bot.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        user: Authenticated user.

    Returns:
        dict: Success message.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")
    await agent_service.delete(agent_id)
    return {"message": "Agent deleted"}


@router.post("/{agent_id}/test-chat")
@limiter.limit("20 per minute")
async def test_chat(
    request: Request,
    agent_id: int,
    body: dict,
    user: User = Depends(get_current_user),
):
    """Test chat with an agent before publishing.

    Args:
        request: FastAPI request for rate limiting.
        agent_id: The agent bot ID.
        body: Should contain {"message": "user's test message"}.
        user: Authenticated user.

    Returns:
        dict: The agent's reply.
    """
    bot = await agent_service.get(agent_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Agent not found")

    message = body.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    exhibition = None
    if bot.exhibition_id:
        exhibition = await exhibition_service.get(bot.exhibition_id)

    runner = ExhibitionAgentRunner(bot, exhibition)
    reply = await runner.chat(message)
    return {"reply": reply}


def _to_response(bot: AgentBot) -> AgentBotResponse:
    """Convert an AgentBot model to response schema."""
    return AgentBotResponse(
        id=bot.id,
        owner_id=bot.owner_id,
        exhibition_id=bot.exhibition_id,
        name=bot.name,
        welcome_message=bot.welcome_message,
        sample_questions=bot.sample_questions,
        system_prompt=bot.system_prompt,
        custom_knowledge=bot.custom_knowledge,
        contact_info=bot.contact_info,
        config=bot.config,
        share_token=bot.share_token,
        is_published=bot.is_published,
        daily_limit=bot.daily_limit,
        session_turn_limit=bot.session_turn_limit,
        total_conversations=bot.total_conversations,
    )
