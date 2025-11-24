# SCHNITTWERK Development Setup

## Prerequisites

- **Node.js** 20.x or later
- **pnpm** 9.x (`npm install -g pnpm`)
- **Docker** (for local Supabase)
- **Supabase CLI** (`pnpm add -g supabase`)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd schnittwerk
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local values. For development, you can use:
- Local Supabase (recommended) or cloud project
- Stripe test keys from your Stripe dashboard

### 3. Start Local Supabase

```bash
supabase start
```

This will output your local Supabase credentials. Update `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` → API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role key

### 4. Run Migrations

```bash
supabase db reset
```

This applies all migrations and seeds the database.

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm db:generate` | Generate TypeScript types from DB |
| `pnpm db:reset` | Reset database and rerun migrations |

## Local Services

When running `supabase start`:

| Service | URL |
|---------|-----|
| Studio | http://localhost:54323 |
| API | http://localhost:54321 |
| Database | postgresql://postgres:postgres@localhost:54322/postgres |
| Inbucket (Email) | http://localhost:54324 |

## Stripe Testing

Use Stripe test keys and test card numbers:

| Card | Number |
|------|--------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| 3D Secure | 4000 0027 6000 3184 |

For webhooks locally, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

See [Architecture](./architecture.md) for detailed structure explanation.

## Troubleshooting

### Supabase won't start

Check Docker is running:
```bash
docker ps
```

### Type generation fails

Ensure Supabase is running:
```bash
supabase status
```

### Port already in use

Kill the process or change port:
```bash
lsof -i :3000
kill -9 <PID>
```
