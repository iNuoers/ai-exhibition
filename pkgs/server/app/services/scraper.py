"""Exhibition scraping service — fetches exhibition pages and extracts structured data via LLM.

Supports two modes:
1. Direct HTML fetch (works for server-rendered pages)
2. Headless rendering via Jina Reader API (works for JS-rendered SPA pages like Nuxt/React)

Falls back automatically: try direct fetch first, if LLM extraction yields mostly
null fields, retry via Jina Reader for a fully-rendered version.
"""

import json
from typing import Any

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
)

from app.core.logging import logger
from app.services.llm import llm_service

SCRAPE_SYSTEM_PROMPT = """你是一个展会信息提取专家。用户会给你一个展会网页的文本内容，请提取以下字段并返回严格的 JSON（不要包含 markdown 代码块标记）：

{
  "name": "展会名称",
  "start_date": "YYYY-MM-DD 或 null",
  "end_date": "YYYY-MM-DD 或 null",
  "venue": "场馆名称",
  "city": "城市",
  "address": "详细地址",
  "industry": "所属行业",
  "ticket_type": "票种（免费/收费）",
  "cycle": "举办周期",
  "visitor_count": "观众人数",
  "exhibitor_count": "展商数量",
  "exhibition_area": "展出面积",
  "organizer": "主办方",
  "description": "展会简介（一段话）",
  "highlights": ["亮点1", "亮点2"],
  "exhibit_scope": {"类别1": "描述", "类别2": "描述"},
  "co_located_events": ["同期展会1", "同期展会2"]
}

只返回 JSON，不要任何其他文字。如果某个字段无法从内容中提取，设为 null。"""

# Key fields that should be non-null for a good extraction
_QUALITY_FIELDS = ("start_date", "end_date", "venue", "city", "industry")

# Jina Reader API — free, no API key required, renders JS pages to markdown
_JINA_READER_PREFIX = "https://r.jina.ai/"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def fetch_page_text(url: str) -> str:
    """Fetch a web page directly and return its text content.

    Args:
        url: The URL to fetch.

    Returns:
        str: The page text content (raw HTML).
    """
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=3, max=15))
async def fetch_rendered_page(url: str) -> str:
    """Fetch a JS-rendered page via Jina Reader API (returns clean markdown).

    Args:
        url: The URL to fetch.

    Returns:
        str: The rendered page content as markdown.
    """
    jina_url = f"{_JINA_READER_PREFIX}{url}"
    logger.info("fetching_rendered_page_via_jina", url=url)

    async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
        response = await client.get(
            jina_url,
            headers={"Accept": "text/markdown", "X-No-Cache": "true"},
        )
        response.raise_for_status()
        text = response.text
        logger.info("rendered_page_fetched", url=url, content_length=len(text))
        return text


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=8))
async def extract_exhibition_data(page_text: str) -> dict[str, Any]:
    """Use the LLM to extract structured exhibition data from raw HTML/text/markdown.

    Args:
        page_text: Raw page content (HTML or markdown).

    Returns:
        dict: Structured exhibition data.
    """
    # Truncate to avoid token limits — keep first 12000 chars for rendered markdown
    truncated = page_text[:12000]

    messages = [
        {"role": "system", "content": SCRAPE_SYSTEM_PROMPT},
        {"role": "user", "content": truncated},
    ]

    response = await llm_service.call(messages)
    content = response.content if hasattr(response, "content") else str(response)

    # Handle list-of-blocks content from some models
    if isinstance(content, list):
        content = "".join(block.get("text", "") if isinstance(block, dict) else str(block) for block in content)

    # Strip markdown code fences if present
    content = content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1] if "\n" in content else content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    data: dict[str, Any] = json.loads(content)
    logger.info("exhibition_data_extracted", name=data.get("name"))
    return data


def _extraction_quality(data: dict[str, Any]) -> float:
    """Score extraction quality: ratio of key fields that are non-null.

    Args:
        data: Extracted exhibition data.

    Returns:
        float: Quality score between 0.0 and 1.0.
    """
    filled = sum(1 for f in _QUALITY_FIELDS if data.get(f) is not None)
    return filled / len(_QUALITY_FIELDS)


async def scrape_exhibition(url: str) -> dict[str, Any]:
    """End-to-end scrape: fetch → extract → quality check → maybe retry with renderer.

    Strategy:
    1. Try direct HTTP fetch + LLM extraction
    2. If quality is poor (< 60% key fields filled), retry via Jina Reader
       which renders JavaScript and returns clean markdown

    Args:
        url: Exhibition page URL.

    Returns:
        dict: Structured exhibition data with source_url injected.
    """
    logger.info("scraping_exhibition", url=url)

    # Attempt 1: direct fetch
    try:
        page_text = await fetch_page_text(url)
        data = await extract_exhibition_data(page_text)
        quality = _extraction_quality(data)
        logger.info("direct_scrape_quality", url=url, quality=quality)

        if quality >= 0.6:
            data["source_url"] = url
            return data

        logger.warning("direct_scrape_low_quality_retrying_with_renderer", url=url, quality=quality)
    except Exception as e:
        logger.warning("direct_scrape_failed_trying_renderer", url=url, error=str(e))

    # Attempt 2: rendered page via Jina Reader
    rendered_text = await fetch_rendered_page(url)
    data = await extract_exhibition_data(rendered_text)
    quality = _extraction_quality(data)
    logger.info("rendered_scrape_quality", url=url, quality=quality)

    data["source_url"] = url
    return data
