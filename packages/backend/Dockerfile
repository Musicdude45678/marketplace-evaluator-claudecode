FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
RUN npm install --workspace=packages/shared --workspace=packages/backend --workspace=packages/frontend

FROM deps AS build-shared
COPY packages/shared ./packages/shared
RUN npm run build --workspace=packages/shared

FROM deps AS build-frontend
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY packages/frontend ./packages/frontend
RUN npm run build --workspace=packages/frontend

FROM deps AS build-backend
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY packages/backend ./packages/backend
RUN npm run build --workspace=packages/backend

FROM base AS runner
COPY --from=build-backend /app/node_modules ./node_modules
COPY --from=build-backend /app/packages/shared/dist ./packages/shared/dist
COPY --from=build-backend /app/packages/backend/dist ./packages/backend/dist
COPY --from=build-backend /app/packages/backend/drizzle ./packages/backend/drizzle
COPY packages/backend/src/admin.html ./packages/backend/dist/admin.html
COPY --from=build-frontend /app/packages/frontend/dist ./packages/frontend/dist

WORKDIR /app/packages/backend
ENV NODE_ENV=production
ENV FRONTEND_DIST=/app/packages/frontend/dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
