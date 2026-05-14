"""Tests for Pydantic schemas (request/response validation)."""

import pytest
from pydantic import ValidationError

from app.schemas.agent import (
    AgentBotCreate,
    AgentBotGenerateRequest,
    AgentBotUpdate,
    ExhibitionCreate,
    ExhibitionScrapeRequest,
    PublicChatRequest,
)


class TestExhibitionSchemas:
    """Test Exhibition request schemas validation."""

    def test_exhibition_create_minimal(self) -> None:
        """ExhibitionCreate only requires name."""
        data = ExhibitionCreate(name="Test Exhibition")
        assert data.name == "Test Exhibition"
        assert data.venue is None

    def test_exhibition_create_empty_name_rejected(self) -> None:
        """ExhibitionCreate rejects empty name."""
        with pytest.raises(ValidationError):
            ExhibitionCreate(name="")

    def test_scrape_request(self) -> None:
        """ExhibitionScrapeRequest requires url."""
        data = ExhibitionScrapeRequest(url="https://example.com/exhibition")
        assert data.url == "https://example.com/exhibition"


class TestAgentBotSchemas:
    """Test AgentBot request schemas validation."""

    def test_agent_bot_create_minimal(self) -> None:
        """AgentBotCreate only requires name."""
        data = AgentBotCreate(name="My Bot")
        assert data.name == "My Bot"
        assert data.daily_limit == 100
        assert data.session_turn_limit == 20

    def test_agent_bot_create_empty_name_rejected(self) -> None:
        """AgentBotCreate rejects empty name."""
        with pytest.raises(ValidationError):
            AgentBotCreate(name="")

    def test_agent_bot_create_limits(self) -> None:
        """AgentBotCreate validates limit ranges."""
        data = AgentBotCreate(name="Bot", daily_limit=500, session_turn_limit=50)
        assert data.daily_limit == 500

        with pytest.raises(ValidationError):
            AgentBotCreate(name="Bot", daily_limit=0)  # ge=1

        with pytest.raises(ValidationError):
            AgentBotCreate(name="Bot", daily_limit=99999)  # le=10000

    def test_agent_bot_update_partial(self) -> None:
        """AgentBotUpdate allows partial updates."""
        data = AgentBotUpdate(name="New Name")
        assert data.name == "New Name"
        assert data.welcome_message is None
        assert data.system_prompt is None

    def test_agent_bot_update_all_none(self) -> None:
        """AgentBotUpdate with no fields is valid."""
        data = AgentBotUpdate()
        assert data.name is None

    def test_generate_request(self) -> None:
        """AgentBotGenerateRequest requires exhibition_id."""
        data = AgentBotGenerateRequest(exhibition_id=1)
        assert data.exhibition_id == 1
        assert data.language == "zh"

        data_en = AgentBotGenerateRequest(exhibition_id=2, language="en")
        assert data_en.language == "en"


class TestPublicChatSchemas:
    """Test visitor/public chat schemas."""

    def test_public_chat_request(self) -> None:
        """PublicChatRequest requires message."""
        data = PublicChatRequest(message="展会什么时候开始？")
        assert data.message == "展会什么时候开始？"
        assert data.visitor_session_id is None

    def test_public_chat_request_with_session(self) -> None:
        """PublicChatRequest accepts visitor_session_id."""
        data = PublicChatRequest(message="Hello", visitor_session_id="abc-123")
        assert data.visitor_session_id == "abc-123"

    def test_public_chat_request_empty_rejected(self) -> None:
        """PublicChatRequest rejects empty message."""
        with pytest.raises(ValidationError):
            PublicChatRequest(message="")

    def test_public_chat_request_too_long_rejected(self) -> None:
        """PublicChatRequest rejects messages over 3000 chars."""
        with pytest.raises(ValidationError):
            PublicChatRequest(message="x" * 3001)
