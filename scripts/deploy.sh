#!/usr/bin/env bash
# TriageAI — Deploy Script
# Usage: ./scripts/deploy.sh [staging|production]
#
# Prerequisites:
#   1. SSH access to the target EC2 instance
#   2. Docker + Docker Compose installed on the instance
#   3. .env file with all production secrets copied to the server
#   4. Domain DNS pointed to the EC2 public IP

set -euo pipefail

ENV="${1:-staging}"
REMOTE_USER="${DEPLOY_USER:-ubuntu}"
REMOTE_HOST="${DEPLOY_HOST:-}"
REMOTE_DIR="/opt/triageai"
COMPOSE_FILE="docker-compose.prod.yml"

if [ -z "$REMOTE_HOST" ]; then
  echo "❌ DEPLOY_HOST not set. Usage:"
  echo "   DEPLOY_HOST=12.34.56.78 ./scripts/deploy.sh production"
  exit 1
fi

echo "🚀 Deploying TriageAI to ${ENV} (${REMOTE_HOST})..."

# 1. Sync project files to server (excluding dev artifacts)
echo "📦 Syncing files..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.venv' \
  --exclude='__pycache__' \
  --exclude='.env.local' \
  --exclude='frontend/dist' \
  --exclude='postgres_data' \
  ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

# 2. Build and start containers on the remote server
echo "🐳 Building and starting containers..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" <<REMOTE_SCRIPT
  cd ${REMOTE_DIR}
  docker compose -f ${COMPOSE_FILE} build --no-cache
  docker compose -f ${COMPOSE_FILE} up -d
  docker compose -f ${COMPOSE_FILE} ps
REMOTE_SCRIPT

# 3. Wait for health check
echo "🏥 Waiting for health check..."
sleep 10

HEALTH_URL="https://${DOMAIN:-triageai.ca}/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health check passed (HTTP ${HTTP_CODE})"
else
  echo "⚠️  Health check returned HTTP ${HTTP_CODE}"
  echo "   Run: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker compose -f ${COMPOSE_FILE} logs api'"
fi

# 4. Run smoke tests
echo "🧪 Running smoke tests..."
cd backend
BASE_URL="https://${DOMAIN:-triageai.ca}" .venv/bin/pytest tests/smoke/ -v 2>/dev/null || {
  echo "⚠️  Some smoke tests failed — review output above"
}

echo ""
echo "🎉 Deployment to ${ENV} complete!"
echo "   Dashboard: https://${DOMAIN:-triageai.ca}/dashboard"
echo "   API Docs:  https://${DOMAIN:-triageai.ca}/docs (staging only)"
