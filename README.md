# Vansh — Digital Family Tree

A private, Hindi/English family-history web application for Indian families.

## Product goals
- Interactive, data-driven family tree
- Private family workspaces and role-based collaboration
- Indian kinship labels in Hindi and English
- AI assistant grounded in authorized family records
- Family stories, photos, and exportable records

## Planned stack
- Next.js App Router + TypeScript
- Tailwind CSS
- React Flow (`@xyflow/react`)
- Supabase Auth, PostgreSQL, Storage, and Row Level Security
- OpenAI API via server-side routes only
- Vercel deployment

## Development status
Repository initialized. Next milestone: scaffold the application shell and database schema. No production features are considered complete until implemented and tested.

## Local development
Node.js 20.9+ recommended.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and configure Supabase before using authenticated or persistent features.

## Privacy principles
- Family data is private by default.
- Every family-owned record is scoped to a family workspace.
- Authorization is enforced server-side and with database RLS.
- AI may only access data through authorized server tools.
- AI-proposed edits require explicit user confirmation.
