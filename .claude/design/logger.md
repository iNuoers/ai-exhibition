# 📊 全链路可观测性与大模型追踪设计 (Observability & Tracing)

> 💡 **架构师寄语**：在一个集成了前端、Node.js BFF、Python 异步后端、LangGraph 循环网络以及外部 LLM 接口的异构系统中，单纯的 `logger.info` 毫无意义。我们的日志设计必须升维到“可观测性 (Observability)”，解决**跨语言 Trace 透传**、**AI Agent 行为审计**以及**Token 成本控制**的深水区问题。

## 1. 跨语言全链路追踪 (Distributed Tracing)

系统中的任何一次用户提问，其生命周期会跨越多个物理和逻辑边界。

### 1.1 W3C Trace Context 规范
系统必须全面采纳 [W3C Trace Context](https://www.w3.org/TR/trace-context/) 标准。
- **发起端 (App/Chat)**：在发起 HTTP 请求时，生成符合规范的 `traceparent` (例如: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`) 并附加到 Header。
- **中继端 (Next.js BFF)**：拦截 Header 中的 `traceparent`，在进行 SSR 数据预取或调用下游时，原样透传给 FastAPI。
- **接收端 (FastAPI)**：通过中间件解析 `traceparent`，并将其注入到 `contextvars` (Python) 中，确保当前 asyncio 协程及其子协程内打印的所有日志均自动附带 `trace_id` 和 `span_id`。

## 2. LLM 与 LangGraph 专属监控层

大模型应用具有不可预测性。不仅要记录“代码是不是报错了”，还要记录“AI 在想什么，它做了什么决策”。

### 2.1 引入 LangSmith 或 OpenTelemetry
LangGraph 复杂的循环状态机靠纯文本日志极难调试。
- 必须在 FastAPI 中配置 `LANGCHAIN_TRACING_V2=true`，将 Agent 的 Prompt 构造、Tool 调用、LLM 原始出入参自动旁路上报给 LangSmith（或通过 OpenTelemetry 导出至 Jaeger）。
- 这解决了：“为什么 AI 刚才给出了一个错误的展会时间？”这种传统的 Trace 无法解答的业务逻辑问题。

### 2.2 Token 成本审计日志
每一笔大模型 API 调用，其 `usage` (Prompt Tokens, Completion Tokens) 必须被硬编码记录。
- **规范**：在 LLM 调用返回时，系统必须强制在 `INFO` 级别打印如下格式的 JSON Audit Log，以供 Elasticsearch / ClickHouse 解析并进行成本看板计算。
```json
{
  "event_type": "llm_audit",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "tenant_id": "10012",
  "model": "claude-3-opus-20240229",
  "latency_ms": 2340,
  "usage": {
    "prompt_tokens": 1250,
    "completion_tokens": 420,
    "total_cost_usd": 0.04
  }
}
```

## 3. 结构化日志 (Structured Logging) 落地方案

### 3.1 Python (pkgs/server) 落地
- 彻底废弃 Python 默认的 `print` 和简单的 `logging` 字符串格式化。
- 引入 `structlog` 库，配置 Processor 链：
  - 本地开发：渲染为带颜色的 `ConsoleRenderer`。
  - 生产环境：渲染为单行不可分割的 `JSONRenderer`。
- 自动将 `contextvars` 中的 `trace_id` 合并到每一条日志的顶层。

### 3.2 Node.js (pkgs/admin, pkgs/chat) 落地
- 使用 `pino` 作为 Next.js 端的日志标准。
- 对于 Next.js 的 Server Component / Server Actions 中捕获的错误，通过 `pino` 输出 JSON 日志。
- **前端生产安全**：使用 Webpack/SWC 插件，在 Build 阶段自动剔除所有客户端的 `console.log`，防止敏感状态数据泄露。

## 4. 警报阈值与降级策略

- **LLM 限流与降级 (Circuit Breaker)**：监控 LLM 的 HTTP 429 或 504 错误。当错误率在 1 分钟内超过 15%，触发熔断，降级返回缓存答案或引导用户稍后再试，同时向企业微信/钉钉发出 `CRITICAL` 级别警报。
- **Pydantic 验证风暴**：如果 `/api/v1/agents/` 连续出现 HTTP 422 错误，通常意味着大模型的输出格式（Schema）发生了严重漂移（如 JSON 结构被打破），此时也应触发报警。