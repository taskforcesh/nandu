# Base Node.js image
FROM node:22-bullseye-slim AS builder

# Set version argument (will be passed from GitHub Actions)
ARG VERSION=dev

# Set working directory
WORKDIR /app

# Enable and prepare corepack for Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy root package files
COPY package.json yarn.lock ./

# Copy only the service and dashboard package.json files
# (Dashboard is needed as it's served by the service)
COPY packages/service/package.json ./packages/service/
COPY packages/dashboard/package.json ./packages/dashboard/

# Install dependencies (focusing only on service and dashboard)
RUN yarn workspaces focus @nandu/service @nandu/dashboard

# Debug: Check where yarn is storing modules in the builder stage
RUN find /app -type d -name "node_modules" | sort
RUN find /app -name "http-status-codes" | sort
RUN ls -la /app/.yarn || echo "No .yarn directory"

# Copy only the necessary source code
COPY packages/service ./packages/service/
COPY packages/dashboard ./packages/dashboard/

# Build service and dashboard packages
RUN yarn workspace @nandu/dashboard run build
# Ensure server.ts is included in the build
RUN cd packages/service && yarn build

# Final image
FROM node:22-bullseye-slim

# Set version argument for the final image
ARG VERSION=dev

# Set working directory
WORKDIR /app

# Install system dependencies including PostgreSQL client
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack for Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Create app directory and set permissions
RUN mkdir -p /app/logs /app/storage/db /app/storage/packages && \
    mkdir -p /app/packages/service/node_modules && \
    chown -R node:node /app

# Copy all package.json files to maintain the monorepo structure
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/yarn.lock ./
COPY --from=builder --chown=node:node /app/packages/service/package.json ./packages/service/
COPY --from=builder --chown=node:node /app/packages/dashboard/package.json ./packages/dashboard/

# Copy the built code
COPY --from=builder --chown=node:node /app/packages/service/dist ./packages/service/dist/
COPY --from=builder --chown=node:node /app/packages/dashboard/dist ./packages/dashboard/dist/

# Set production environment
ENV NODE_ENV=production

# Install as root, we'll switch to node user later
# USER node is moved to after dependency installation

# Expose the service port (Nandu uses port 4567 by default)
EXPOSE 4567

# Volume for persistent storage
VOLUME ["/app/storage"]

# Add version label from package.json
LABEL org.opencontainers.image.version=${VERSION:-dev}
LABEL org.opencontainers.image.title="Nandu NPM Registry"
LABEL org.opencontainers.image.description="Nandu is an open source NPM registry compatible with Npm, Yarn and Pnpm"
LABEL org.opencontainers.image.authors="Taskforce.sh Inc."
LABEL org.opencontainers.image.url="https://github.com/taskforcesh/nandu"
LABEL org.opencontainers.image.source="https://github.com/taskforcesh/nandu"
LABEL org.opencontainers.image.licenses="AGPL-3.0"


# Disable Yarn PnP and use classic node_modules instead
RUN yarn config set nodeLinker node-modules

# Install dependencies the classic way so we can avoid PnP permission issues
RUN yarn install
RUN yarn workspaces focus @nandu/service @nandu/dashboard --production

# Set proper permissions for all files
RUN chown -R node:node /app

# Switch to node user before running the application
USER node

# The actual command to run the service - using server.js as the entry point
CMD ["node", "packages/service/dist/server.js"]

# Healthcheck - checks database connectivity
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4567/-/ping || exit 1