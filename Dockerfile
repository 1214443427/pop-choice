FROM node:24-alpine AS client
WORKDIR /app
COPY frontend/package*.json ./client/
COPY shared/package*.json ./shared/
RUN npm ci --prefix ./shared
RUN npm ci --prefix ./client
COPY shared/ ./shared/
COPY frontend/ ./client/
RUN npm run build --prefix ./client

FROM node:24-alpine AS server-deps
WORKDIR /app
COPY backend/package*.json ./server/
COPY shared/package*.json ./shared/
RUN npm ci --omit=dev --prefix ./shared
RUN npm ci --omit=dev --prefix ./server

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=server-deps --chown=node:node /app/server/node_modules/ ./server/node_modules/
COPY --from=server-deps --chown=node:node /app/shared/node_modules/ ./shared/node_modules/
COPY backend/ ./server/
COPY shared/ ./shared/
COPY --from=client --chown=node:node /app/client/dist/ /app/server/public/
USER node
EXPOSE 3000
CMD ["npm", "start", "--prefix", "./server"]