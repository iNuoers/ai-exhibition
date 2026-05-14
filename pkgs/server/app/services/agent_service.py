"""AgentBot database service — CRUD + AI generation."""

from typing import (
    List,
    Optional,
)

from sqlmodel import (
    Session,
    col,
    select,
)

from app.core.langgraph.agent_factory import generate_agent_config
from app.core.logging import logger
from app.models.agent_bot import AgentBot
from app.models.exhibition import Exhibition
from app.schemas.agent import (
    AgentBotCreate,
    AgentBotUpdate,
)
from app.services.database import database_service


class AgentService:
    """Service for AgentBot CRUD and AI generation."""

    async def create(self, body: AgentBotCreate, owner_id: int) -> AgentBot:
        """Create an agent bot from manual input.

        Args:
            body: Agent bot data.
            owner_id: Owner user ID.

        Returns:
            AgentBot: The created agent bot.
        """
        with Session(database_service.engine) as session:
            bot = AgentBot(
                **body.model_dump(exclude_none=True),
                owner_id=owner_id,
            )
            session.add(bot)
            session.commit()
            session.refresh(bot)
            logger.info("agent_bot_created", agent_id=bot.id, name=bot.name)
            return bot

    async def generate_from_exhibition(
        self, exhibition: Exhibition, owner_id: int, language: str = "zh"
    ) -> AgentBot:
        """AI-generate an agent bot from exhibition data.

        Args:
            exhibition: The exhibition to base the agent on.
            owner_id: Owner user ID.
            language: Target language.

        Returns:
            AgentBot: The generated agent bot.
        """
        config = await generate_agent_config(exhibition, language)

        with Session(database_service.engine) as session:
            bot = AgentBot(
                owner_id=owner_id,
                exhibition_id=exhibition.id,
                name=config.get("name", f"{exhibition.name} AI客服"),
                welcome_message=config.get("welcome_message", ""),
                sample_questions=config.get("sample_questions"),
                system_prompt=config.get("system_prompt", ""),
            )
            session.add(bot)
            session.commit()
            session.refresh(bot)
            logger.info("agent_bot_generated", agent_id=bot.id, exhibition_id=exhibition.id)
            return bot

    async def get(self, agent_id: int) -> Optional[AgentBot]:
        """Get an agent bot by ID."""
        with Session(database_service.engine) as session:
            return session.get(AgentBot, agent_id)

    async def get_by_share_token(self, share_token: str) -> Optional[AgentBot]:
        """Get an agent bot by share token."""
        with Session(database_service.engine) as session:
            statement = select(AgentBot).where(AgentBot.share_token == share_token)
            return session.exec(statement).first()

    async def list_by_owner(self, owner_id: int) -> List[AgentBot]:
        """List all agent bots owned by a user."""
        with Session(database_service.engine) as session:
            statement = (
                select(AgentBot)
                .where(col(AgentBot.owner_id) == owner_id)
                .order_by(col(AgentBot.created_at).desc())
            )
            return list(session.exec(statement).all())

    async def update(self, agent_id: int, body: AgentBotUpdate) -> AgentBot:
        """Update an agent bot.

        Args:
            agent_id: The agent bot ID.
            body: Fields to update.

        Returns:
            AgentBot: The updated agent bot.
        """
        with Session(database_service.engine) as session:
            bot = session.get(AgentBot, agent_id)
            if not bot:
                raise ValueError("Agent not found")
            update_data = body.model_dump(exclude_none=True)
            for key, value in update_data.items():
                setattr(bot, key, value)
            session.add(bot)
            session.commit()
            session.refresh(bot)
            logger.info("agent_bot_updated", agent_id=agent_id)
            return bot

    async def publish(self, agent_id: int) -> AgentBot:
        """Publish an agent bot."""
        with Session(database_service.engine) as session:
            bot = session.get(AgentBot, agent_id)
            if not bot:
                raise ValueError("Agent not found")
            bot.is_published = True
            session.add(bot)
            session.commit()
            session.refresh(bot)
            logger.info("agent_bot_published", agent_id=agent_id, share_token=bot.share_token)
            return bot

    async def unpublish(self, agent_id: int) -> AgentBot:
        """Unpublish an agent bot."""
        with Session(database_service.engine) as session:
            bot = session.get(AgentBot, agent_id)
            if not bot:
                raise ValueError("Agent not found")
            bot.is_published = False
            session.add(bot)
            session.commit()
            session.refresh(bot)
            logger.info("agent_bot_unpublished", agent_id=agent_id)
            return bot

    async def delete(self, agent_id: int) -> bool:
        """Delete an agent bot."""
        with Session(database_service.engine) as session:
            bot = session.get(AgentBot, agent_id)
            if not bot:
                return False
            session.delete(bot)
            session.commit()
            logger.info("agent_bot_deleted", agent_id=agent_id)
            return True

    async def increment_conversation_count(self, agent_id: int) -> None:
        """Increment the conversation counter for an agent bot."""
        with Session(database_service.engine) as session:
            bot = session.get(AgentBot, agent_id)
            if bot:
                bot.total_conversations += 1
                session.add(bot)
                session.commit()


agent_service = AgentService()
