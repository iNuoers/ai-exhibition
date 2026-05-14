"""Public (visitor) chat API — no authentication required."""

import json
import uuid
from typing import Optional

from fastapi import (
    APIRouter,
    HTTPException,
    Request,
)
from fastapi.responses import StreamingResponse

from app.core.langgraph.agent_factory import ExhibitionAgentRunner
from app.core.limiter import limiter
from app.core.logging import logger
from app.schemas.agent import (
    PublicAgentInfo,
    PublicChatRequest,
)
from app.schemas.chat import StreamResponse
from app.services.agent_service import agent_service
from app.services.exhibition_service import exhibition_service

router = APIRouter()

# In-memory visitor session store (swap for Redis in production)
_visitor_sessions: dict[str, list[dict]] = {}

# Simple daily counter (swap for Redis in production)
_daily_counters: dict[int, int] = {}


@router.get("/{share_token}", response_model=PublicAgentInfo)
@limiter.limit("30 per minute")
async def get_public_agent(request: Request, share_token: str):
    """Get public agent info for visitors.

    Args:
        request: FastAPI request for rate limiting.
        share_token: The agent's share token.

    Returns:
        PublicAgentInfo: Agent name, welcome message, sample questions.
    """
    bot = await agent_service.get_by_share_token(share_token)
    if not bot or not bot.is_published:
        raise HTTPException(status_code=404, detail="Agent not found")

    exhibition_name: Optional[str] = None
    if bot.exhibition_id:
        exhibition = await exhibition_service.get(bot.exhibition_id)
        if exhibition:
            exhibition_name = exhibition.name

    return PublicAgentInfo(
        agent_name=bot.name,
        exhibition_name=exhibition_name,
        welcome_message=bot.welcome_message,
        sample_questions=bot.sample_questions,
        contact_info=bot.contact_info,
    )


@router.post("/{share_token}/chat")
@limiter.limit("10 per minute")
async def public_chat(
    request: Request,
    share_token: str,
    body: PublicChatRequest,
):
    """Visitor chat with a published agent (non-streaming).

    Args:
        request: FastAPI request for rate limiting.
        share_token: The agent's share token.
        body: Visitor message and optional session ID.

    Returns:
        dict: The agent's reply and session ID.
    """
    bot = await agent_service.get_by_share_token(share_token)
    if not bot or not bot.is_published:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Daily limit check
    count = _daily_counters.get(bot.id, 0)
    if count >= bot.daily_limit:
        raise HTTPException(status_code=429, detail="Daily conversation limit reached for this agent")

    # Session management
    visitor_session_id = body.visitor_session_id or str(uuid.uuid4())
    history = _visitor_sessions.get(visitor_session_id, [])

    # Turn limit
    if len(history) >= bot.session_turn_limit * 2:
        raise HTTPException(status_code=429, detail="Session turn limit reached")

    # Build runner
    exhibition = None
    if bot.exhibition_id:
        exhibition = await exhibition_service.get(bot.exhibition_id)

    runner = ExhibitionAgentRunner(bot, exhibition)

    try:
        reply = await runner.chat(body.message, history)

        # Update history
        history.append({"role": "user", "content": body.message})
        history.append({"role": "assistant", "content": reply})
        _visitor_sessions[visitor_session_id] = history

        # Update counters
        _daily_counters[bot.id] = count + 1

        logger.info(
            "public_chat_completed",
            share_token=share_token,
            visitor_session_id=visitor_session_id,
        )

        return {
            "reply": reply,
            "visitor_session_id": visitor_session_id,
        }
    except Exception as e:
        logger.exception("public_chat_failed", share_token=share_token, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate response")


@router.post("/{share_token}/chat/stream")
@limiter.limit("10 per minute")
async def public_chat_stream(
    request: Request,
    share_token: str,
    body: PublicChatRequest,
):
    """Visitor chat with streaming response.

    Args:
        request: FastAPI request for rate limiting.
        share_token: The agent's share token.
        body: Visitor message and optional session ID.

    Returns:
        StreamingResponse: SSE stream of the agent's reply.
    """
    bot = await agent_service.get_by_share_token(share_token)
    if not bot or not bot.is_published:
        raise HTTPException(status_code=404, detail="Agent not found")

    count = _daily_counters.get(bot.id, 0)
    if count >= bot.daily_limit:
        raise HTTPException(status_code=429, detail="Daily conversation limit reached for this agent")

    visitor_session_id = body.visitor_session_id or str(uuid.uuid4())
    history = _visitor_sessions.get(visitor_session_id, [])

    if len(history) >= bot.session_turn_limit * 2:
        raise HTTPException(status_code=429, detail="Session turn limit reached")

    exhibition = None
    if bot.exhibition_id:
        exhibition = await exhibition_service.get(bot.exhibition_id)

    runner = ExhibitionAgentRunner(bot, exhibition)

    async def event_generator():
        """Generate SSE events."""
        full_reply = ""
        try:
            async for chunk in runner.stream_chat(body.message, history):
                full_reply += chunk
                response = StreamResponse(content=chunk, done=False)
                yield f"data: {json.dumps(response.model_dump(mode='json'))}\n\n"

            final = StreamResponse(content="", done=True)
            yield f"data: {json.dumps(final.model_dump(mode='json'))}\n\n"

            # Update history after stream completes
            history.append({"role": "user", "content": body.message})
            history.append({"role": "assistant", "content": full_reply})
            _visitor_sessions[visitor_session_id] = history
            _daily_counters[bot.id] = count + 1

        except Exception as e:
            logger.exception("public_stream_failed", share_token=share_token, error=str(e))
            error_resp = StreamResponse(content=str(e), done=True)
            yield f"data: {json.dumps(error_resp.model_dump(mode='json'))}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Visitor-Session-Id": visitor_session_id},
    )
