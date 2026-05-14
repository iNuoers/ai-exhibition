"""Tests for Exhibition and AgentBot models."""

from datetime import date

import pytest

from app.models.exhibition import Exhibition
from app.models.agent_bot import AgentBot


class TestExhibitionModel:
    """Test Exhibition model construction and defaults."""

    def test_create_exhibition_minimal(self) -> None:
        """Exhibition can be created with only required fields."""
        exhibition = Exhibition(name="Test Exhibition", owner_id=1)
        assert exhibition.name == "Test Exhibition"
        assert exhibition.owner_id == 1
        assert exhibition.start_date is None
        assert exhibition.venue is None
        assert exhibition.highlights is None

    def test_create_exhibition_full(self) -> None:
        """Exhibition can be created with all fields populated."""
        exhibition = Exhibition(
            name="2026室内空间六面一体化展览会",
            start_date=date(2026, 5, 27),
            end_date=date(2026, 5, 29),
            venue="国家会展中心（上海）",
            city="上海",
            address="上海市青浦区崧泽大道333号",
            industry="家居",
            ticket_type="免费",
            cycle="一年一届",
            visitor_count="130,000人",
            exhibitor_count="2,500+",
            exhibition_area="300,000㎡",
            organizer="DOMOTEX asia",
            description="聚焦装饰装修行业多品类融合趋势",
            highlights=["顶流集结", "建装一体", "设计驱动"],
            exhibit_scope={"地面材料": "地板、地毯", "墙面材料": "墙纸、墙布"},
            co_located_events=["Domotex asia", "BUILD ASIA Mega Show"],
            source_url="https://example.com/exhibition",
            details={"raw": "data"},
            owner_id=1,
        )
        assert exhibition.name == "2026室内空间六面一体化展览会"
        assert exhibition.start_date == date(2026, 5, 27)
        assert exhibition.end_date == date(2026, 5, 29)
        assert len(exhibition.highlights) == 3
        assert "地面材料" in exhibition.exhibit_scope
        assert len(exhibition.co_located_events) == 2


class TestAgentBotModel:
    """Test AgentBot model construction and defaults."""

    def test_create_agent_bot_minimal(self) -> None:
        """AgentBot can be created with only required fields."""
        bot = AgentBot(name="Test Bot", owner_id=1)
        assert bot.name == "Test Bot"
        assert bot.owner_id == 1
        assert bot.is_published is False
        assert bot.daily_limit == 100
        assert bot.session_turn_limit == 20
        assert bot.total_conversations == 0
        assert bot.share_token  # auto-generated, should not be empty

    def test_create_agent_bot_full(self) -> None:
        """AgentBot can be created with all fields populated."""
        bot = AgentBot(
            name="展会AI客服",
            owner_id=1,
            exhibition_id=42,
            welcome_message="欢迎访问展会！",
            sample_questions=["展会时间？", "怎么报名？", "展品范围？"],
            system_prompt="你是展会客服...",
            custom_knowledge={"qa_pairs": [{"q": "价格？", "a": "免费"}], "text": "补充信息"},
            contact_info={"微信": "wechat123", "电话": "400-1234"},
            config={"temperature": 0.3},
            daily_limit=200,
            session_turn_limit=30,
        )
        assert bot.name == "展会AI客服"
        assert bot.exhibition_id == 42
        assert len(bot.sample_questions) == 3
        assert bot.custom_knowledge["qa_pairs"][0]["q"] == "价格？"
        assert bot.contact_info["微信"] == "wechat123"
        assert bot.daily_limit == 200

    def test_share_token_uniqueness(self) -> None:
        """Each AgentBot should get a unique share_token."""
        bot1 = AgentBot(name="Bot1", owner_id=1)
        bot2 = AgentBot(name="Bot2", owner_id=1)
        assert bot1.share_token != bot2.share_token
