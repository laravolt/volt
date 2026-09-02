# Velix — Remix 3.0.0-rc.1 on Node. No bundling step: the asset server compiles browser modules on
# demand (minified, fingerprinted with BUILD_ID) and Node runs TypeScript via remix/node-tsx.
FROM node:24-bookworm-slim AS base
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git python3 make g++ unzip \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
WORKDIR /app

# Install all deps (Tailwind CLI is a devDependency needed to build CSS). velix-catalyst is a
# private git dependency: pass credentials via BuildKit secret or a token in the URL at build time.
FROM base AS build
COPY package.json bun.lock ./
RUN --mount=type=secret,id=gitcredentials,target=/root/.git-credentials \
    git config --global credential.helper store && bun install --frozen-lockfile
COPY . .
RUN npm run -s css

# Runtime image: production deps only + built CSS
FROM base AS runtime
ARG BUILD_ID=dev
ENV BUILD_ID=${BUILD_ID} PORT=5555 DATABASE_FILE=/data/velix.sqlite
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public/app.css ./public/app.css
COPY . .
RUN mkdir -p /data tmp && chown -R node:node /app /data
USER node
VOLUME ["/data"]
EXPOSE 5555
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://localhost:5555/ > /dev/null || exit 1
# Run pending migrations, then start the server.
CMD ["sh", "-c", "node --import remix/node-tsx app/data/migrate.ts up && node --import remix/node-tsx server.ts"]
