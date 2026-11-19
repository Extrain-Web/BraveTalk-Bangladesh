# BraveTalk Bangladesh — backend API (Express + TypeScript)

# ── Build stage ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime stage ───────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# System Chromium for invoice / money-receipt PDFs (puppeteer)
RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium fonts-noto fonts-noto-color-emoji ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=5000 \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist

# Uploaded files (covers, PDFs, class materials) — mount a persistent volume here
RUN mkdir -p /app/uploads/materials
VOLUME ["/app/uploads"]

EXPOSE 5000
CMD ["node", "dist/server.js"]
