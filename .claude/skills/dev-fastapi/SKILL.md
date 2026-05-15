---
name: dev-fastapi
description: 开发后端服务 (pkgs/server) 时使用的技能。重点强调使用 Pydantic 定义出入参，路由声明，LangGraph 节点隔离与类型规范，以及强制异步 IO 规范。
---

# FastAPI & LangGraph 后端开发规范

> 本指南为 `pkgs/server` 提供标准化的开发流，确保 API 健壮性、AI Agent 工作流的可维护性以及严格的类型安全。

## 何时使用此技能

- 开发新的 FastAPI 路由接口
- 修改数据库模型 (SQLAlchemy)
- 编写或调整 LangGraph 节点和状态图
- 处理后端的 bug 修复与重构

## 核心原则

### 🔴 必须遵守的规则

1. **类型安全**：所有函数、路由、内部工具必须拥有完整的 Python Type Hints。
2. **Schema 驱动**：API 入参和出参必须使用 `pydantic` V2 (如 `BaseModel`) 定义，并在 Router 的签名中通过其进行验证。
3. **强制异步**：禁止在 asyncio 事件循环中调用阻塞 I/O 操作。数据库操作必须使用 `asyncpg` + 异步的 SQLAlchemy session。第三方阻塞包必须使用 `run_in_threadpool`。
4. **Agent 节点纯粹**：LangGraph 的 Node 仅仅是一个函数。严禁在一个 Node 中混杂 HTTP 请求校验、数据库提交和大规模 LLM 交互。保持单一职责。
5. **环境变量隔离**：严禁硬编码任何 Secret (如 OpenAI Key)，必须从 `core.config.settings` 导入。

## 开发流程

### 步骤 1: 定义 Pydantic Schema
**位置**: `pkgs/server/app/schemas/`
先为你的接口定义入参和出参：

```python
from pydantic import BaseModel, Field

class ExhibitionCreateRequest(BaseModel):
    url: str = Field(..., description="待抓取的展会官网 URL")
    tenant_id: int = Field(..., description="商户ID")

class ExhibitionResponse(BaseModel):
    id: int = Field(..., description="展会记录ID")
    title: str = Field(..., description="展会标题")
    status: str = Field(..., description="抓取状态")
```

### 步骤 2: 编写业务逻辑 (Service 层 / LangGraph 层)
**位置**: `pkgs/server/app/services/` 或 `pkgs/server/app/agents/`

如果是 Agent 流程，定义清晰的 `TypedDict` State：
```python
from typing import TypedDict, Annotated
import operator

class ScrapeState(TypedDict):
    url: str
    html_content: str
    extracted_json: Annotated[dict, operator.ior]  # 增量更新
    errors: list[str]
```

编写节点函数：
```python
async def fetch_html_node(state: ScrapeState) -> dict:
    url = state["url"]
    # 异步抓取逻辑
    html = await async_fetch(url)
    return {"html_content": html}
```

### 步骤 3: 编写 API 路由
**位置**: `pkgs/server/app/api/routers/`

在路由中组合前面的内容，并注入数据库 Session。

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.exhibition import ExhibitionCreateRequest, ExhibitionResponse
from app.db.session import get_db
from app.services import exhibition_service

router = APIRouter(prefix="/exhibitions", tags=["Exhibitions"])

@router.post("/", response_model=ExhibitionResponse)
async def create_exhibition(
    request: ExhibitionCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    提交一个展会抓取任务，启动后台工作流。
    """
    result = await exhibition_service.start_scrape_task(db, request)
    return result
```

## 开发示例：处理 LangGraph 中的报错
不要在路由层强行捕获 LangGraph 的深度异常。确保 Node 将错误写入 State，最终在返回给客户端或轮询接口中呈现。