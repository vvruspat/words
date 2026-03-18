#!/usr/bin/env bash

export PATH="/opt/homebrew/opt/libpq/bin:/opt/homebrew/bin:$PATH"

# sync-db.sh — copy production DB (Supabase) to local for development
# Usage: ./scripts/sync-db.sh [--no-confirm]
#
# Requires: supabase CLI, psql (PostgreSQL client tools)
# Production credentials: set in scripts/.env.production (never commit this file)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.production"
DUMP_FILE="/tmp/words_prod_dump_$(date +%Y%m%d_%H%M%S).sql"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Load production credentials ───────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${RED}Error:${NC} $ENV_FILE not found."
  echo ""
  echo "Create it with your production DB credentials:"
  echo "  cp $SCRIPT_DIR/.env.production.example $ENV_FILE"
  echo "  # then fill in real values"
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# ── Load local credentials from apps/api/.env ────────────────────────────────
LOCAL_ENV="$SCRIPT_DIR/../apps/api/.env"
if [[ -f "$LOCAL_ENV" ]]; then
  LOCAL_PG_HOST=$(grep -E '^PG_HOST=' "$LOCAL_ENV" | cut -d'=' -f2- | tr -d '"')
  LOCAL_PG_PORT=$(grep -E '^PG_PORT=' "$LOCAL_ENV" | cut -d'=' -f2- | tr -d '"')
  LOCAL_PG_USER=$(grep -E '^PG_USER=' "$LOCAL_ENV" | cut -d'=' -f2- | tr -d '"')
  LOCAL_PG_PASSWORD=$(grep -E '^PG_PASSWORD=' "$LOCAL_ENV" | cut -d'=' -f2- | tr -d '"')
  LOCAL_PG_DATABASE=$(grep -E '^PG_DATABASE=' "$LOCAL_ENV" | cut -d'=' -f2- | tr -d '"')
fi

# Allow overriding local vars from environment
LOCAL_PG_HOST="${LOCAL_PG_HOST:-localhost}"
LOCAL_PG_PORT="${LOCAL_PG_PORT:-5436}"
LOCAL_PG_USER="${LOCAL_PG_USER:-postgres}"
LOCAL_PG_PASSWORD="${LOCAL_PG_PASSWORD:-example}"
LOCAL_PG_DATABASE="${LOCAL_PG_DATABASE:-words_dev}"

# ── Validate prod env vars ────────────────────────────────────────────────────
if [[ -z "${PROD_PG_URL:-}" ]]; then
  required_vars=(PROD_PG_HOST PROD_PG_PORT PROD_PG_USER PROD_PG_PASSWORD PROD_PG_DATABASE)
  for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      echo -e "${RED}Error:${NC} $var is not set in $ENV_FILE"
      echo "Set either PROD_PG_URL or all individual PROD_PG_* variables."
      exit 1
    fi
  done
  # Build URL from individual vars for display
  PROD_DISPLAY="$PROD_PG_USER@$PROD_PG_HOST:$PROD_PG_PORT/$PROD_PG_DATABASE"
else
  # Parse display string from URL (hide password)
  PROD_DISPLAY=$(echo "$PROD_PG_URL" | sed 's|postgresql://[^:]*:[^@]*@|postgresql://***:***@|')
fi

# ── Confirmation prompt ───────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}WARNING: This will OVERWRITE your local database!${NC}"
echo ""
echo "  Production:  $PROD_DISPLAY"
echo "  Local:       $LOCAL_PG_USER@$LOCAL_PG_HOST:$LOCAL_PG_PORT/$LOCAL_PG_DATABASE"
echo ""

if [[ "${1:-}" != "--no-confirm" ]]; then
  read -r -p "Continue? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# ── Dump from production ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}▶ Dumping production DB...${NC}"

# Parse URL components explicitly — pg_dump mis-parses usernames that contain a dot
PROD_HOST=$(echo "$PROD_PG_URL"     | sed -E 's|postgresql://[^@]+@([^:/]+).*|\1|')
PROD_PORT=$(echo "$PROD_PG_URL"     | sed -E 's|.*:([0-9]+)/.*|\1|')
PROD_USER=$(echo "$PROD_PG_URL"     | sed -E 's|postgresql://([^:]+):.*|\1|')
PROD_PASSWORD=$(echo "$PROD_PG_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
PROD_DBNAME=$(echo "$PROD_PG_URL"   | sed -E 's|.*/([^?]+).*|\1|')

# SSL required for Supabase
export PGSSLMODE=require

PGPASSWORD="$PROD_PASSWORD" pg_dump \
  --host="$PROD_HOST" \
  --port="$PROD_PORT" \
  --username="$PROD_USER" \
  --dbname="$PROD_DBNAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --schema=public \
  --file="$DUMP_FILE"

unset PGSSLMODE

# Strip statements that conflict with a fresh local DB
sed -i '' \
  -e '/transaction_timeout/d' \
  -e '/^CREATE SCHEMA public;/d' \
  "$DUMP_FILE"

echo "  Dump saved to: $DUMP_FILE"

# ── Restore to local ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}▶ Restoring to local DB...${NC}"

# Drop and recreate local database
PGPASSWORD="$LOCAL_PG_PASSWORD" psql \
  --host="$LOCAL_PG_HOST" \
  --port="$LOCAL_PG_PORT" \
  --username="$LOCAL_PG_USER" \
  --dbname="postgres" \
  --quiet \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$LOCAL_PG_DATABASE' AND pid <> pg_backend_pid();" \
  -c "DROP DATABASE IF EXISTS \"$LOCAL_PG_DATABASE\";" \
  -c "CREATE DATABASE \"$LOCAL_PG_DATABASE\";"

# Ensure required extensions exist
PGPASSWORD="$LOCAL_PG_PASSWORD" psql \
  --host="$LOCAL_PG_HOST" \
  --port="$LOCAL_PG_PORT" \
  --username="$LOCAL_PG_USER" \
  --dbname="$LOCAL_PG_DATABASE" \
  --quiet \
  -c "CREATE EXTENSION IF NOT EXISTS vector;" \
  -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# Restore dump (plain SQL — use psql)
PGPASSWORD="$LOCAL_PG_PASSWORD" psql \
  --host="$LOCAL_PG_HOST" \
  --port="$LOCAL_PG_PORT" \
  --username="$LOCAL_PG_USER" \
  --dbname="$LOCAL_PG_DATABASE" \
  -v ON_ERROR_STOP=1 \
  --quiet \
  -f "$DUMP_FILE"

# ── Cleanup ───────────────────────────────────────────────────────────────────
rm -f "$DUMP_FILE"

echo ""
echo -e "${GREEN}✓ Done!${NC} Local DB '$LOCAL_PG_DATABASE' now contains production data."
