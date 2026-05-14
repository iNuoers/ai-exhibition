"""Tests for agent_factory — system prompt building and config generation."""

from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.core.langgraph.agent_factory import (
    ExhibitionAgentRunner,
    build_exhibition_system_prompt,
)
from app.models.agent_bot import AgentBot
from app.models.exhibition import Exhibition


class TestBuildSystemPrompt:
    """Test system prompt construction logic."""

    def _make_exhibition(self) -> Exhibition:
        """Create a test exhibition."""
        return Exhibition(
            id=1,
            name="2026室内空间六面一体化展览会",
            start_date=date(2026, 5, 27),
            end_date=date(2026, 5, 29),
            venue="国家会展中心（上海）",
            city="上海",
            address="上海市青浦区崧泽大道333号",
            industry="家居",
            ticket_type="免费",
            visitor_count="130,000人",
            organizer="DOMOTEX asia",
            description="聚焦装饰装修行业多品类融合趋势",
            highlights=["顶流集结", "建装一体"],
            exhibit_scope={"地面材料": "地板、地毯"},
            co_located_events=["Domotex asia"],
            owner_id=1,
        )

    def _make_bot(self, **kwargs) -> AgentBot:
        """Create a test agent bot."""
        defaults = {
            "id": 1,
            "name": "展会AI客服",
            "owner_id": 1,
            "welcome_message": "欢迎来到展会！",
        }
        defaults.update(kwargs)
        return AgentBot(**defaults)

    def test_prompt_contains_bot_name(self) -> None:
        """System prompt should contain the bot name."""
        bot = self._make_bot()
        prompt = build_exhibition_system_prompt(bot)
        assert "展会AI客服" in prompt

    def test_prompt_contains_welcome_message(self) -> None:
        """System prompt should contain the welcome message."""
        bot = self._make_bot()
        prompt = build_exhibition_system_prompt(bot)
        assert "欢迎来到展会！" in prompt

    def test_prompt_contains_exhibition_info(self) -> None:
        """System prompt should contain exhibition details when provided."""
        bot = self._make_bot()
        exhibition = self._make_exhibition()
        prompt = build_exhibition_system_prompt(bot, exhibition)

        assert "2026室内空间六面一体化展览会" in prompt
        assert "国家会展中心（上海）" in prompt
        assert "上海" in prompt
        assert "家居" in prompt
        assert "130,000人" in prompt
        assert "2026-05-27" in prompt
        assert "顶流集结" in prompt
        assert "地面材料" in prompt
        assert "Domotex asia" in prompt

    def test_prompt_without_exhibition(self) -> None:
        """System prompt should work without exhibition."""
        bot = self._make_bot()
        prompt = build_exhibition_system_prompt(bot)
        assert "展会AI客服" in prompt
        assert "展会基本信息" not in prompt

    def test_prompt_with_custom_knowledge(self) -> None:
        """System prompt should include custom knowledge."""
        bot = self._make_bot(
            custom_knowledge={
                "qa_pairs": [{"q": "价格是多少？", "a": "免费参观"}],
                "text": "我们公司专注于智能家居",
            }
        )
        prompt = build_exhibition_system_prompt(bot)
        assert "价格是多少？" in prompt
        assert "免费参观" in prompt
        assert "我们公司专注于智能家居" in prompt

    def test_prompt_with_contact_info(self) -> None:
        """System prompt should include contact info for human handoff."""
        bot = self._make_bot(
            contact_info={"微信": "wechat123", "电话": "400-1234-5678"}
        )
        prompt = build_exhibition_system_prompt(bot)
        assert "转人工" in prompt or "联系方式" in prompt
        assert "wechat123" in prompt
        assert "400-1234-5678" in prompt

    def test_prompt_contains_safety_rules(self) -> None:
        """System prompt should contain safety rules."""
        bot = self._make_bot()
        prompt = build_exhibition_system_prompt(bot)
        assert "不编造" in prompt
        assert "不透露" in prompt


class TestExhibitionAgentRunner:
    """Test the ExhibitionAgentRunner chat interface."""

    def _make_runner(self) -> ExhibitionAgentRunner:
        """Create a test runner with mocked LLM."""
        bot = AgentBot(id=1, name="Test Bot", owner_id=1)
        exhibition = Exhibition(
            id=1, name="Test Exhibition", owner_id=1,
            venue="Test Venue", city="Test City",
        )
        return ExhibitionAgentRunner(bot, exhibition)

    @pytest.mark.asyncio
    async def test_chat_returns_string(self) -> None:
        """chat() should return a string response."""
        runner = self._make_runner()

        mock_response = MagicMock()
        mock_response.content = "展会将于5月27日开幕。"

        with patch.object(runner.llm_service, "call", new_callable=AsyncMock, return_value=mock_response):
            result = await runner.chat("展会什么时候开始？")

        assert isinstance(result, str)
        assert "5月27日" in result

    @pytest.mark.asyncio
    async def test_chat_with_history(self) -> None:
        """chat() should accept conversation history."""
        runner = self._make_runner()

        mock_response = MagicMock()
        mock_response.content = "是的，在上海举办。"

        history = [
            {"role": "user", "content": "展会在哪里？"},
            {"role": "assistant", "content": "展会在上海举办。"},
        ]

        with patch.object(runner.llm_service, "call", new_callable=AsyncMock, return_value=mock_response) as mock_call:
            result = await runner.chat("确定是上海吗？", history)

        # Verify history was passed (system + 2 history + 1 new = 4 messages)
        call_args = mock_call.call_args[0][0]
        assert len(call_args) == 4
        assert call_args[0]["role"] == "system"

    @pytest.mark.asyncio
    async def test_chat_handles_list_content(self) -> None:
        """chat() should handle list-type content from some models."""
        runner = self._make_runner()

        mock_response = MagicMock()
        mock_response.content = [{"type": "text", "text": "回答内容"}]

        with patch.object(runner.llm_service, "call", new_callable=AsyncMock, return_value=mock_response):
            result = await runner.chat("测试")

        assert "回答内容" in result
