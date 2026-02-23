# Supabase full dump → local Docker Postgres

This repo contains a single script that:

1. Creates a full dump of a Supabase Postgres database.
2. Spins up a local Docker Postgres container (if needed).
3. Restores the dump into the local container.

## Requirements

- Docker
- A Supabase database connection string

## Setup

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set `SUPABASE_DB_URL`.

## Run

```bash
./dump_supabase_to_local.sh
```

## Configuration

The script reads the following variables from `.env` (or the environment):

- `SUPABASE_DB_URL` (required)
- `LOCAL_CONTAINER` (default: `supabase-local`)
- `LOCAL_DB_NAME` (default: `postgres`)
- `LOCAL_PG_PASSWORD` (default: `postgres`)
- `LOCAL_PG_PORT` (default: `5432`)
- `DUMP_FILE` (default: `supabase_dump.dump`)

## Notes

- The dump uses `pg_dump -Fc` for a custom-format backup.
- Restores use `pg_restore --clean --if-exists --no-owner` to replace existing objects.
- The local container uses `postgres:16`.
