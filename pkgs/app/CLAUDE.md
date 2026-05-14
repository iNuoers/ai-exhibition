# Exhibition App - 微信小程序前端

Taro 4 + React 18 + TypeScript + Tailwind CSS (via weapp-tailwindcss) + Taroify 组件库。

## 核心约束（微信小程序环境）

- **强制使用 Taro 组件**：`<View>`, `<Text>`, `<Image>`, `<ScrollView>` 等，禁止 HTML 标签（`div`, `span`, `img`, `p`）
- **无 DOM 环境**：禁止 `document.*`, `window.*`, `localStorage`，使用 `Taro.setStorageSync` / `Taro.getStorageSync`
- **网络请求**：必须使用 `Taro.request`，禁止 `fetch` 或 `axios`
- **样式方案**：Tailwind CSS 工具类写在 `className` 中，已通过 `weapp-tailwindcss` 适配小程序
- **UI 组件库**：复杂 UI（按钮、表单、弹窗）优先使用 Taroify (`@taroify/core`)

## 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动微信小程序开发模式
npm run dev:weapp

# 3. 打开微信开发者工具，导入项目
#    - 项目目录选择 pkgs/app/dist
#    - AppID 填写 project.config.json 中的 appid（或使用测试号）
#    - 勾选"不校验合法域名"（开发阶段连接本地后端）
```

### 常用命令

```bash
npm run dev:weapp     # 微信小程序开发模式（热更新）
npm run build:weapp   # 微信小程序生产构建
npm run dev:h5        # H5 开发模式（浏览器预览）
```

### 后端联调

后端 API 默认运行在 `http://localhost:8000`，小程序开发时需在微信开发者工具中勾选"不校验合法域名"才能访问本地接口。

## 目录结构

```
src/
├── app.ts              # 应用入口
├── app.config.ts       # 全局配置（页面路由、tabBar）
├── app.css             # 全局样式
├── pages/              # 页面目录（每个页面一个文件夹）
│   └── <pageName>/
│       ├── index.tsx        # 页面组件
│       ├── index.config.ts  # 页面配置
│       └── index.css        # 页面样式
├── components/         # 公共组件（待创建）
├── services/           # API 服务层（待创建）
├── store/              # 状态管理（待创建）
└── utils/              # 工具函数（待创建）
```

## React 开发规范

- 仅使用函数式组件 + Hooks，禁止 class 组件
- 组件文件使用 kebab-case `agent-card.tsx`），页面目录使用 kebab-case（如 `pages/agent-detail/`）
- Props 必须定义 TypeScript interface，以 `Props` 后缀命名
- 使用 `React.memo` 包裹纯展示组件，`useMemo` / `useCallback` 优化性能

## API 服务层规范

```
src/services/
├── request.ts          # 基于 Taro.request 的通用请求封装
└── <module>/
    ├── index.ts        # API 方法定义
    └── types.ts        # 请求/响应类型
```

类型命名规则：`模块名 + 类型描述`
- 实体：`UserInfo`, `ExhibitionItem`
- 请求参数：`UserLoginParams`, `ExhibitionCreateParams`
- 响应：`UserLoginResponse`, `ExhibitionListResponse`

API 方法命名：动词 + 名词（`getUserInfo`, `createExhibition`, `deleteAgent`）

## 状态管理

使用 Zustand：
- 每个 store 独立文件，放在 `src/store/` 下
- 导出 selector hooks 而非整个 store
- 需要持久化的 store 使用 Taro storage adapter

## 样式规范

- 优先使用 Tailwind 工具类
- 需要自定义样式时使用页面级 CSS 文件
- CSS 类名使用 BEM 命名：`block_element__modifier`（注意：block 和 element 用 `_` 分隔，modifier 用 `__`）

## 代码规范

### 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | kebab-case | `agent-card.tsx` |
| 页面目录 | kebab-case | `pages/agent-detail/` |
| 工具函数 | kebab-case | `format-date.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS 类 | BEM (kebab-case) | `agent-card_title__active` |

### 导入顺序

1. React / Taro 核心
2. 第三方库（Taroify 等）
3. 项目内组件
4. 项目内工具 / 服务
5. 样式文件
