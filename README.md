# Cloudflare Workers React Starter

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)]([![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jclarke-star/tae-kwondo-attendance))

A production-ready full-stack starter template for building modern web applications with Cloudflare Workers, React, and TypeScript. Features a serverless backend powered by Hono and Durable Objects for persistent state management (users, chats), paired with a responsive React frontend using shadcn/ui, TanStack Query, and Tailwind CSS.

## Features

- **Serverless Backend**: Cloudflare Workers with Hono routing, CORS, and logging.
- **Persistent Storage**: Custom Durable Objects implementation for entities (Users, ChatBoards) with indexing for efficient listing/pagination.
- **Real-time Chat Demo**: CRUD operations for users, chat boards, and messages.
- **Modern Frontend**: React 18, Vite, Router, TanStack Query for data fetching/caching, shadcn/ui components.
- **Theming**: Dark/light mode with `next-themes`.
- **UI/UX**: Responsive design, animations, glassmorphism effects, sidebar layout.
- **Type-Safe**: Full TypeScript support across frontend, worker, and shared types.
- **Error Handling**: Global error boundaries, client error reporting.
- **Development Tools**: Hot reload, linting, Tailwind JIT, Bun support.

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React
- **Data**: TanStack Query, Zod (validation-ready)
- **State/UI**: React Router, Framer Motion, Sonner (toasts)
- **Build/Tools**: Bun, Wrangler, ESLint, PostCSS

## Quick Start

1. **Clone & Install**:
   ```bash
   git clone <your-repo>
   cd <project>
   bun install
   ```

2. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (frontend) with worker proxy.

3. **Deploy**:
   ```bash
   bun deploy
   ```

## Installation

This project uses Bun for fast installs and scripting.

```bash
# Install dependencies
bun install

# Generate Worker types (if needed)
bun cf-typegen
```

**Prerequisites**:
- Bun 1.0+ (`curl -fsSL https://bun.sh/install | bash`)
- Cloudflare account & Wrangler CLI (`bunx wrangler@latest login`)

## Development

- **Frontend + Worker**: `bun dev` (Vite dev server proxies `/api/*` to Worker).
- **Worker Only**: `bunx wrangler dev` (full Worker emulation).
- **Type Generation**: `bun cf-typegen` (updates `worker/env.d.ts`).
- **Lint**: `bun lint`.
- **Build**: `bun build` (produces `dist/` for deployment).
- **Preview**: `bun preview`.

API endpoints (proxied via frontend):
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat
- `GET/POST /api/chats/:chatId/messages` - List/send messages

Frontend data fetching uses `src/lib/api-client.ts` with TanStack Query hooks.

## Customization

- **Routes**: Add to `worker/user-routes.ts`, imported dynamically in `worker/index.ts`.
- **Entities**: Extend `worker/entities.ts` using `IndexedEntity` base (auto-indexing, seeding).
- **UI**: Use shadcn components (`@/components/ui/*`), edit `src/pages/HomePage.tsx`.
- **Theme**: Toggle via `ThemeToggle`, customize `tailwind.config.js`.
- **Sidebar**: Optional `AppLayout` in `src/components/layout/`.

Seed data in `shared/mock-data.ts` auto-loads on first request.

## Deployment

Deploy to Cloudflare Workers with zero-config:

```bash
# Login (one-time)
bunx wrangler login

# Deploy
bun deploy
```

Configures:
- Pages/Assets for static frontend.
- Durable Objects (`GlobalDurableObject`).
- SPA routing (`assets.not_found_handling: "single-page-application"`).

**[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jclarke-star/tae-kwondo-attendance)**

Environment vars/bindings auto-migrated via `wrangler.jsonc`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server (frontend + worker) |
| `bun build` | Build for production |
| `bun preview` | Local preview of build |
| `bun deploy` | Build + deploy to Cloudflare |
| `bun lint` | Lint codebase |
| `bun cf-typegen` | Generate Worker types |

## Folder Structure

```
├── src/              # React app
├── worker/           # Cloudflare Worker (Hono API)
├── shared/           # Shared types/mock data
├── public/           # Static assets
└── wrangler.jsonc    # Deployment config
```

## Contributing

1. Fork & clone.
2. `bun install`.
3. `bun dev` for local dev.
4. Submit PR.

## License

MIT. See [LICENSE](LICENSE) for details.