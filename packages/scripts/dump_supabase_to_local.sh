#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

SUPABASE_DB_URL=${SUPABASE_DB_URL:-""}
LOCAL_CONTAINER=${LOCAL_CONTAINER:-"supabase-local"}
LOCAL_DB_NAME=${LOCAL_DB_NAME:-"postgres"}
LOCAL_PG_PASSWORD=${LOCAL_PG_PASSWORD:-"postgres"}
LOCAL_PG_PORT=${LOCAL_PG_PORT:-"5432"}
DUMP_FILE=${DUMP_FILE:-"supabase_dump.dump"}
# Postgres image to use for pg_dump and local container. Default to postgres:17
POSTGRES_IMAGE=${POSTGRES_IMAGE:-"postgres:17"}

if [ -z "$SUPABASE_DB_URL" ]; then
  echo "SUPABASE_DB_URL is required (e.g. from Supabase database settings)." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required." >&2
  exit 1
fi

# Ensure container exists (use configured Postgres image)
if ! docker ps -a --format '{{.Names}}' | grep -q "^${LOCAL_CONTAINER}$"; then
  docker run -d \
    --name "$LOCAL_CONTAINER" \
    -e POSTGRES_PASSWORD="$LOCAL_PG_PASSWORD" \
    -e POSTGRES_DB="$LOCAL_DB_NAME" \
    -p "$LOCAL_PG_PORT":5432 \
    "$POSTGRES_IMAGE"
elif ! docker ps --format '{{.Names}}' | grep -q "^${LOCAL_CONTAINER}$"; then
  docker start "$LOCAL_CONTAINER"
fi

# Wait for Postgres inside the container to accept connections
echo "Waiting for Postgres container '$LOCAL_CONTAINER' to be ready..."
for i in {1..60}; do
  if docker exec "$LOCAL_CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then
    echo "Postgres is ready"
    break
  fi
  sleep 1
  echo -n "."
done
echo

# Create dump using pg_dump from the configured Postgres image (matches server major version)
# Write dump to stdout and redirect on the host to avoid permission/mount issues on macOS
rm -f "$DUMP_FILE"
echo "Creating dump via $POSTGRES_IMAGE -> $DUMP_FILE"
docker run --rm \
  -e PGPASSWORD="$LOCAL_PG_PASSWORD" \
  "$POSTGRES_IMAGE" \
  pg_dump -Fc --schema=public "$SUPABASE_DB_URL" > "$DUMP_FILE"

# Restore using pg_restore from the configured Postgres image (host-side) so
# the client version matches the dump format and avoids "unsupported version" errors.
echo "Restoring dump into database $LOCAL_DB_NAME on $LOCAL_CONTAINER"
docker run --rm -e PGPASSWORD="$LOCAL_PG_PASSWORD" -v "$PWD":/data "$POSTGRES_IMAGE" \
  pg_restore --verbose --clean --if-exists --no-owner --no-acl -d "postgresql://postgres@host.docker.internal:${LOCAL_PG_PORT}/${LOCAL_DB_NAME}" /data/"$DUMP_FILE"

echo "Done. Restored into local container '$LOCAL_CONTAINER' (db: $LOCAL_DB_NAME) on port $LOCAL_PG_PORT."
