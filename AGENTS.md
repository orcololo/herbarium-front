<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-10 | Updated: 2026-05-13 -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FRONTEND — Next.js Admin Dashboard

**Generated:** 2026-05-10
**Stack:** Next.js 16.2.4 · TypeScript · Tailwind CSS

## OVERVIEW

Admin dashboard for Folium. Manages species catalog, specimen registry, and collection sessions via the NestJS REST API. Read-only view of field data collected by the Flutter app. Has its own `.git` (sub-repo, not tracked by monorepo root).

## STRUCTURE

```
frontend/
├── app/
│   ├── (auth)/           # Unauthenticated route group
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   ├── (dashboard)/      # Authenticated route group
│   │   ├── registry/     # Specimen registry: list, [id], new
│   │   ├── sessions/     # Collection sessions: list, [id], new
│   │   └── species/      # Species catalog: list, [id]
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root redirect
├── components/
│   ├── layout/           # Sidebar, header, nav shell
│   └── ui/               # Shared UI primitives
└── lib/
    ├── api.ts            # Typed fetch client — ALL backend calls go here
    └── auth-context.tsx  # React auth context (session state)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add a page | `app/(dashboard)/<resource>/` |
| Add auth page | `app/(auth)/` |
| Add API call | `lib/api.ts` — add typed function, match backend DTO field names |
| Auth session logic | `lib/auth-context.tsx` |
| Shared UI components | `components/ui/` |
| Layout shell (sidebar, nav) | `components/layout/` |

## CONVENTIONS

- **Next.js 16**: App Router only. No `pages/` directory. Check `node_modules/next/dist/docs/` before using any Next.js API — 16.x has breaking changes from 14/15.
- **API types in `lib/api.ts`**: Field names must match the backend Mongoose schema exactly. Drift here breaks display of synced data.
- **Auth**: Context in `lib/auth-context.tsx`. No external auth library — cookie-based JWT from the backend.
- **Styling**: Tailwind only. No CSS modules, no inline styles.
- **TypeScript**: Strict. No `any`.

## ANTI-PATTERNS

- Using `pages/` router — this project uses App Router exclusively.
- Hardcoding API URLs — use the base URL from `lib/api.ts` / `.env.local`.
- Renaming field names in `lib/api.ts` types without matching the backend schema.
- Direct `fetch()` outside `lib/api.ts`.
- `any` TypeScript type.

## COMMANDS

```bash
cd frontend
npm run dev      # Dev server
npm run build    # Production build
npm run start    # Serve production build
```

## NOTES

- `.env.local` holds `NEXT_PUBLIC_API_URL` — required for all API calls.
- `components/layout/` and `components/ui/` directories exist but may be sparsely populated — check before creating duplicates.
- Sub-repo: commit/push from `frontend/` independently of the monorepo root.
