# 🔌 跨端与多技术栈 API 架构设计规范 (Monorepo API Architecture)

> 💡 **架构师寄语**：在 `ai-exhibition` 这个包含 Python (FastAPI), React (Next.js), 小程序 (Taro) 的异构 Monorepo 中，API 设计绝不仅仅是定义 JSON 格式。我们要解决**类型跨语言共享**、**BFF层聚合**、**多端网络限制**以及**AI大模型流式标准化**四个核心架构痛点。

## 1. 架构级 API 通信拓扑

我们的应用存在三种截然不同的网络通信链路，必须分类治理：

1. **Client to Server (Taro -> FastAPI)**：
   - 链路：公网 -> 负载均衡/网关 -> FastAPI。
   - 特征：弱网环境，需携带用户 Token，使用标准的 RESTful 接口。
2. **Server to Server (Next.js SSR/Server Actions -> FastAPI)**：
   - 链路：内网直连（BFF 模式）。
   - 特征：高信任网络，低延迟，由 Next.js 承担页面直出(SSR)时的数据预取。
3. **Client to Edge to Server (Next.js Client -> Next.js Route -> FastAPI)**：
   - 链路：防跨域与安全隐藏。客户端不直接请求 FastAPI，而是通过 Next.js API Routes 代理。

## 2. 跨语言类型共享 (Type Synchronization)

Monorepo 的最大优势是代码复用。后端 Python 和前端 TS 不能各自维护一套数据结构。

### 2.1 CodeGen 管道策略
- **Source of Truth (唯一事实来源)**：`pkgs/server` 中的 FastAPI 自动生成的 `openapi.json`。
- **自动生成工作流**：
  1. FastAPI 通过 Pydantic V2 定义模型并暴露出完整的 OpenAPI 3.1 规范。
  2. 在前端包（或提炼一个 `pkgs/shared` 包）中，使用 `openapi-ts` 或 `orval` 自动抓取 `openapi.json`。
  3. 生成强类型的 TypeScript 接口函数和 React Query (或 SWR) hooks。
- **CI/CD 约束**：任何后端的 Schema 修改，必须保证前端的 CodeGen 能够编译通过，否则阻断 PR。

## 3. 异构端的流式 (SSE) 架构规避与适配

AI 问答强依赖 Server-Sent Events (SSE)，但这在不同技术栈中有巨大差异：

### 3.1 访客端 (pkgs/chat - Next.js)
- **协议标准**：必须兼容 **Vercel AI SDK** 的 Data Stream Protocol。FastAPI 返回的流格式必须能被 `useChat` hook 原生解析（如 `0:"Hello"\n` 这样的 chunks）。
- **优势**：Next.js + 浏览器原生支持 `fetch` 的 `ReadableStream`。

### 3.2 移动端 (pkgs/app - Taro/微信小程序)
- **架构痛点**：微信小程序**不支持**标准的浏览器 SSE（没有 EventSource API）。
- **解决方案**：
  - 方案A：使用微信专属的 `wx.request({ enableChunked: true })` API，并在 Taro 中封装适配器来监听 `onChunkReceived`，并手动解码 UTF-8 字节流。
  - 方案B：WebSocket 替代方案。但为了维护成本，优先推荐 **方案A**（通过双端统一封装 `stream-fetcher` 库）。

## 4. 全局数据信封 (Data Envelope) 演进

抛弃老旧的单一格式，针对 HTTP 状态做严格的语义化分层：

### 4.1 成功响应 (RESTful)
直接返回数据对象本身或分页对象，**不要**强行包一层 `{"code": 200, "data": ...}`。依赖 HTTP 状态码 200/201 表示成功，结合 TS 类型直接解构，最大化利用 Axios/Fetch 原生特性。

### 4.2 错误规范 (RFC 7807 Problem Details)
所有非 2XX 响应，必须遵循 [RFC 7807](https://tools.ietf.org/html/rfc7807) 规范格式：

```json
{
  "type": "https://api.ai-exhibition.com/errors/llm-timeout",
  "title": "大模型响应超时",
  "status": 504,
  "detail": "生成 Agent 设定时 OpenAI 接口超时，请稍后重试。",
  "instance": "/api/v1/agents/123/generate",
  "trace_id": "8f88836b-a2eb-4581-8b3d-1a89c721c54e",
  "invalid_params": [] // 如果是 400 表单验证错误，Pydantic 的 detailed errors 放这里
}
```

## 5. 安全与鉴权边界
- **Next.js (Admin/Chat)**：采用 **NextAuth.js (Auth.js)** 在 BFF 层处理会话 (Cookie/Session)，向下游 FastAPI 通信时，Next.js 服务端将 Session 换取为内部机器通信 Token 或带身份签名的 JWT。
- **Taro (App)**：基于微信的 `code` 换取自定义的 Bearer JWT Token，放入 `Authorization` Header，FastAPI 提供统一的 Dependency 进行校验。