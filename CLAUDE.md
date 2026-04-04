# FreeVideo

基于 SpatialReal SDK 的免费说话视频生成工具网站。

## 技术栈

- **Monorepo**: pnpm workspace
- **Frontend** (`web/`): React 19 + Vite + Tailwind CSS 4 + React Router + TanStack Query
- **Backend** (`api/`): Hono + Cloudflare Workers
- **部署**: Cloudflare (Workers + Pages)

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动前端 (localhost:5173)
pnpm dev:api          # 启动 API (localhost:8787)
pnpm build            # 构建前端
pnpm deploy:api       # 部署 API 到 Cloudflare
pnpm lint             # 全项目 lint
pnpm typecheck        # 全项目类型检查
```

## 目录结构

```
web/                  # React 前端
  src/
    pages/            # 页面组件
    components/       # UI 组件
    lib/              # 工具函数
    api/              # API 客户端
    styles/           # 样式
api/                  # Cloudflare Worker 后端
  src/
    index.ts          # Hono 入口
```

## 代码规范

- TypeScript strict mode
- 路径别名: `@/` -> `web/src/`
- 前端代理: `/api` -> `localhost:8787`
