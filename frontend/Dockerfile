FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build with production API URL — calls go to same domain via Caddy reverse proxy
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Production: serve with Caddy ──────────────────────────────────────────────
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile.frontend /etc/caddy/Caddyfile

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1
