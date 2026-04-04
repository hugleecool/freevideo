# FreeVideo

基于 SpatialReal SDK 的永久免费 AI 数字人说话视频生成网站。

## 技术栈

- **Monorepo**: pnpm workspace
- **Frontend** (`web/`): Vue 3 + TypeScript + Vite + Tailwind CSS 4 + Vue Router
- **Backend** (`api/`): Hono + Cloudflare Workers
- **TTS**: Fish Audio S2-Pro
- **Avatar SDK**: @spatialwalk/avatarkit (SDK Mode)
- **Video Export**: WebCodecs + mp4-muxer
- **部署**: Cloudflare (Workers + Pages)

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动前端 (localhost:5188)
pnpm dev:api          # 启动 API (localhost:8787)
pnpm build            # 构建前端
pnpm deploy:api       # 部署 API 到 Cloudflare
pnpm lint             # 全项目 lint
pnpm typecheck        # 全项目类型检查
```

## 目录结构

```
web/                  # Vue 前端
  src/
    pages/            # 页面组件
    components/       # UI 组件
    composables/      # Vue composables (useAvatar, useRecorder, useTTS)
    lib/              # 工具函数
    styles/           # 样式
api/                  # Cloudflare Worker 后端
  src/
    index.ts          # Hono 入口
    routes/           # API 路由
    lib/              # 工具库
```

## 代码规范

- TypeScript strict mode
- 路径别名: `@/` -> `web/src/`
- 前端代理: `/api` -> `localhost:8787`
- Vue SFC: `<script setup lang="ts">` 风格
