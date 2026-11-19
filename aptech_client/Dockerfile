# ===============================
# Stage 1: Build
# ===============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
# Build tools (TypeScript, Tailwind…) are devDependencies — install them even when NODE_ENV=production
RUN npm ci --include=dev

# Copy all source files
COPY . .

# NEXT_PUBLIC_* values are baked into the browser bundle at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL     NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL     NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Build the Next.js app
RUN npm run build

# ===============================
# Stage 2: Production Image
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app

# Only install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./

# Set environment variables (can override with --env-file)
ENV NODE_ENV=production
ENV PORT=5005

# Expose the port your app runs on
EXPOSE 5005

# Start the Next.js app in production mode
CMD ["npx", "next", "start", "-p", "5005"]