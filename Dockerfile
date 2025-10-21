# Cdw-Spm: Dockerfile SPYMEO V1 - Next.js Application
# Multi-stage build for optimized production image

# ══════════════════════════════════════════════════════════════════
# Stage 1: Builder
# ══════════════════════════════════════════════════════════════════
FROM node:20-bookworm AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# ══════════════════════════════════════════════════════════════════
# Stage 2: Runtime
# ══════════════════════════════════════════════════════════════════
FROM node:20-bookworm AS runtime

WORKDIR /app

# Install bash for entrypoint script
RUN apt-get update && \
    apt-get install -y --no-install-recommends bash && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Security: Create non-root user
RUN useradd -m -u 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build + static assets + public files
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public
COPY --from=build --chown=nextjs:nextjs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nextjs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs:nextjs /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json and entrypoint
COPY --chown=nextjs:nextjs package.json ./
COPY --chown=nextjs:nextjs docker/entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=6 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start application via entrypoint (runs migrations then starts server)
ENTRYPOINT ["/entrypoint.sh"]
