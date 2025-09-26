# 3D Portfolio Monorepo

Tech stack:
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion, React Three Fiber/drei, Zustand
- Backend: Fastify (Node.js), Prisma ORM, PostgreSQL, Redis
- DevOps: Turborepo (pnpm workspaces), Docker Compose, GitHub Actions CI

## Requirements

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (via Docker or local)
- Redis (via Docker or local)

## Getting Started (Development)

1) Install dependencies
```bash
pnpm install
```

2) Start databases in Docker
```bash
docker compose up -d db redis
```

3) Configure backend env
```bash
cp apps/api/.env.example apps/api/.env.development
# Edit apps/api/.env.development as needed (DATABASE_URL, JWT_SECRET, etc.)
```

4) Initialize database
```bash
pnpm --filter @portfolio/api prisma:generate
pnpm --filter @portfolio/api prisma:migrate
pnpm --filter @portfolio/api prisma:seed
```

5) Start all apps
```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

## Docker (optional)

To run the whole stack in Docker:
```bash
docker compose up --build
```

## Workspaces

- apps/web: Next.js frontend
- apps/api: Fastify backend
- packages/*: shared config/packages (future)

## CI

GitHub Actions workflow builds the monorepo and runs basic checks.

## Notes

- Local file uploads (avatars, 3D assets) are saved under `apps/api/uploads` and served at `/uploads/*` by the API.
- Cloudinary/AWS can be plugged in later by setting envs and updating the upload service.
- This is a foundation for Phase 1 and Phase 2 tasks. We can iterate to add admin dashboard pages, advanced 3D components, real auth flows, analytics, etc.