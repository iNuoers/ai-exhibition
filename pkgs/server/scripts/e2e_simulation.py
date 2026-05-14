"""End-to-end simulation: scrape → DB write → AI generate agent → DB write → visitor conversation.

Runs against the real LLM and real PostgreSQL database.
Usage:  APP_ENV=development uv run python scripts/e2e_simulation.py
"""

import asyncio
import sys
import os

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


async def ensure_test_user() -> int:
    """Ensure a test user exists in the DB and return user_id."""
    from app.services.database import database_service

    user = await database_service.get_user_by_email("e2e-test@wemeet.com")
    if user:
        console.print(f"[dim]使用已有测试用户 (id={user.id})[/dim]")
        return user.id

    from app.models.user import User

    user = await database_service.create_user(
        email="e2e-test@wemeet.com",
        password=User.hash_password("test123456"),
        username="E2E测试用户",
    )
    console.print(f"[green]✅ 创建测试用户 (id={user.id})[/green]")
    return user.id


async def main() -> None:
    """Run the full simulation pipeline with real DB writes."""

    console.print(Panel.fit(
        "[bold cyan]🏗️ 展会智能客服平台 — 端到端模拟测试（含数据库写入）[/bold cyan]\n"
        "完整流程：抓取展会→写入DB → AI生成智能体→写入DB → 发布 → 访客对话",
        border_style="cyan",
    ))

    # ── Step 0: Ensure test user ────────────────────────────────────
    user_id = await ensure_test_user()

    # ── Step 1: Scrape exhibitions → write to DB ────────────────────
    console.print("\n[bold yellow]━━━ 第一步：抓取展会数据 → 写入数据库 ━━━[/bold yellow]\n")

    from app.services.exhibition_service import exhibition_service

    urls = [
        "https://www.zhandaren.com/exhibition/info?id=S01KPA073WZJ68BEHE3PAEHCF9A",
        "https://www.zhandaren.com/intl/info?id=S01KEXJJW58SWGMMHWWX74BN4F3",
    ]

    exhibitions = []
    for url in urls:
        console.print(f"[dim]正在抓取并写入数据库: {url}[/dim]")
        try:
            exhibition = await exhibition_service.scrape_and_create(url, user_id)
            exhibitions.append(exhibition)

            table = Table(title=f"✅ 已写入数据库 (id={exhibition.id})", box=box.ROUNDED)
            table.add_column("字段", style="cyan", width=10)
            table.add_column("值", style="white")

            table.add_row("DB ID", str(exhibition.id))
            table.add_row("名称", exhibition.name)
            if exhibition.start_date and exhibition.end_date:
                table.add_row("时间", f"{exhibition.start_date} 至 {exhibition.end_date}")
            table.add_row("场馆", exhibition.venue or "—")
            table.add_row("城市", exhibition.city or "—")
            table.add_row("行业", exhibition.industry or "—")
            table.add_row("票种", exhibition.ticket_type or "—")
            table.add_row("主办方", exhibition.organizer or "—")
            if exhibition.description:
                table.add_row("简介", exhibition.description[:80] + "...")
            if exhibition.highlights:
                table.add_row("亮点", " | ".join(str(h)[:40] for h in exhibition.highlights[:3]))
            if exhibition.exhibit_scope:
                scope_text = " | ".join(f"{k}" for k in list(exhibition.exhibit_scope.keys())[:4])
                table.add_row("展品范围", scope_text)

            console.print(table)
            console.print()
        except Exception as e:
            console.print(f"[red]❌ 抓取失败: {e}[/red]")

    if not exhibitions:
        console.print("[red]没有成功抓取的展会，退出[/red]")
        return

    # Verify DB read-back
    console.print("[bold]📋 验证数据库读取：[/bold]")
    db_exhibitions = await exhibition_service.list_by_owner(user_id)
    console.print(f"  数据库中该用户的展会数量: [green]{len(db_exhibitions)}[/green]")
    for e in db_exhibitions:
        console.print(f"  • id={e.id}, name={e.name}, city={e.city}")

    # ── Step 2: AI generate agents → write to DB ───────────────────
    console.print(f"\n[bold yellow]━━━ 第二步：AI 自动生成智能客服 → 写入数据库 ━━━[/bold yellow]\n")

    from app.services.agent_service import agent_service

    agents = []
    for exhibition in exhibitions:
        console.print(f"[dim]正在为【{exhibition.name}】AI 生成智能客服...[/dim]")
        try:
            bot = await agent_service.generate_from_exhibition(exhibition, user_id, language="zh")
            agents.append(bot)

            console.print(Panel(
                f"[bold green]✅ 智能体已写入数据库 (id={bot.id})[/bold green]\n\n"
                f"[cyan]名称：[/cyan]{bot.name}\n"
                f"[cyan]share_token：[/cyan]{bot.share_token}\n"
                f"[cyan]关联展会ID：[/cyan]{bot.exhibition_id}\n"
                f"[cyan]欢迎语：[/cyan]{bot.welcome_message}\n"
                f"[cyan]示例问题：[/cyan]{', '.join(bot.sample_questions or [])}\n"
                f"[cyan]发布状态：[/cyan]{'已发布' if bot.is_published else '未发布'}",
                title=f"🤖 {bot.name}",
                border_style="green",
            ))
        except Exception as e:
            console.print(f"[red]❌ 生成失败: {e}[/red]")

    # Verify DB read-back
    console.print("[bold]📋 验证数据库读取：[/bold]")
    db_agents = await agent_service.list_by_owner(user_id)
    console.print(f"  数据库中该用户的智能体数量: [green]{len(db_agents)}[/green]")
    for a in db_agents:
        console.print(f"  • id={a.id}, name={a.name}, share_token={a.share_token}, published={a.is_published}")

    # ── Step 3: Publish agents ─────────────────────────────────────
    console.print(f"\n[bold yellow]━━━ 第三步：发布智能体 ━━━[/bold yellow]\n")

    for bot in agents:
        published_bot = await agent_service.publish(bot.id)
        console.print(
            f"  ✅ 【{published_bot.name}】已发布 → "
            f"分享链接: [bold cyan]/api/v1/public/{published_bot.share_token}[/bold cyan]"
        )

    # ── Step 4: Simulate visitor flow (via share_token from DB) ────
    console.print(f"\n[bold yellow]━━━ 第四步：模拟访客通过分享链接进入对话 ━━━[/bold yellow]\n")

    from app.core.langgraph.agent_factory import ExhibitionAgentRunner

    for bot in agents:
        # Step 4a: Look up agent by share_token (simulating GET /public/{token})
        found_bot = await agent_service.get_by_share_token(bot.share_token)
        if not found_bot or not found_bot.is_published:
            console.print(f"[red]❌ 未找到已发布的智能体: {bot.share_token}[/red]")
            continue

        # Load linked exhibition from DB
        linked_exhibition = None
        if found_bot.exhibition_id:
            linked_exhibition = await exhibition_service.get(found_bot.exhibition_id)

        console.print(Panel(
            f"[bold]智能体：[/bold]{found_bot.name}\n"
            f"[bold]关联展会：[/bold]{linked_exhibition.name if linked_exhibition else '无'}\n\n"
            f"{found_bot.welcome_message}\n\n"
            f"[dim]示例问题：[/dim]\n" +
            "\n".join(f"  {i}. {q}" for i, q in enumerate(found_bot.sample_questions or [], 1)),
            title=f"🤖 访客看到的页面 (token={found_bot.share_token})",
            border_style="blue",
        ))

        # Step 4b: Visitor conversation
        runner = ExhibitionAgentRunner(found_bot, linked_exhibition)

        visitor_questions = list(found_bot.sample_questions or [])[:2] + [
            "怎么报名参观？",
            "找人工客服怎么办？",
        ]

        # Add contact_info for first agent to test human handoff
        if not found_bot.contact_info and bot is agents[0]:
            from app.schemas.agent import AgentBotUpdate

            await agent_service.update(
                found_bot.id,
                AgentBotUpdate(contact_info={"微信": "zhandaren_service", "电话": "400-888-0000"}),
            )
            # Reload runner with contact info
            found_bot = await agent_service.get(found_bot.id)
            runner = ExhibitionAgentRunner(found_bot, linked_exhibition)

        history: list[dict] = []
        for q in visitor_questions:
            console.print(f"\n[bold white]👤 访客：[/bold white]{q}")
            reply = await runner.chat(q, history)
            console.print(f"[bold blue]🤖 客服：[/bold blue]{reply}")
            history.append({"role": "user", "content": q})
            history.append({"role": "assistant", "content": reply})

        console.print()

    # ── Step 5: Final DB verification ──────────────────────────────
    console.print(f"\n[bold yellow]━━━ 第五步：最终数据库验证 ━━━[/bold yellow]\n")

    from app.services.database import database_service
    from sqlmodel import Session, text

    with Session(database_service.engine) as session:
        ex_count = session.exec(text("SELECT COUNT(*) FROM exhibition")).one()[0]
        bot_count = session.exec(text("SELECT COUNT(*) FROM agentbot")).one()[0]
        published_count = session.exec(text("SELECT COUNT(*) FROM agentbot WHERE is_published = true")).one()[0]

    verify_table = Table(title="📊 数据库最终状态", box=box.DOUBLE)
    verify_table.add_column("表", style="cyan")
    verify_table.add_column("记录数", style="green", justify="right")
    verify_table.add_row("exhibition", str(ex_count))
    verify_table.add_row("agentbot (总数)", str(bot_count))
    verify_table.add_row("agentbot (已发布)", str(published_count))
    verify_table.add_row("user", "1+")
    console.print(verify_table)

    # Summary
    console.print(Panel.fit(
        f"[bold green]✅ 端到端模拟测试完成（含数据库写入）[/bold green]\n\n"
        f"• 展会抓取并写入数据库：{len(exhibitions)} 个\n"
        f"• AI生成智能体并写入数据库：{len(agents)} 个\n"
        f"• 智能体发布：{len(agents)} 个\n"
        f"• 通过 share_token 访客对话：{len(agents)} 个智能体各完成对话\n"
        f"• 数据库验证：exhibition={ex_count}, agentbot={bot_count} ✅",
        title="📊 最终测试报告",
        border_style="green",
    ))


if __name__ == "__main__":
    asyncio.run(main())
