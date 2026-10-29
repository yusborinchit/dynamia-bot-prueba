FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY api/package.json api/
COPY packages/contracts/package.json packages/contracts/
RUN pnpm install --frozen-lockfile --filter @wsp/api...
COPY packages/contracts packages/contracts
COPY api api
RUN pnpm --filter @wsp/api build
RUN pnpm --filter @wsp/api deploy --prod --legacy /out

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/node_modules node_modules
COPY --from=build /out/package.json package.json
COPY --from=build /repo/api/dist dist
COPY --from=build /repo/api/drizzle drizzle
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/migrate.js && node dist/server.js"]
