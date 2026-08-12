FROM node:24-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/
COPY package*.json /app/
RUN npm ci
COPY shared/ ./shared/
COPY frontend/ ./frontend/
RUN npm run build -w frontend

FROM node:24-alpine AS server-deps
WORKDIR /app
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/
COPY package*.json /app/
RUN npm ci --omit=dev --workspace backend

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=server-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=server-deps --chown=node:node /app/backend/ ./backend/
COPY --from=server-deps --chown=node:node /app/shared/ ./shared/
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY --from=frontend --chown=node:node /app/frontend/dist/ /app/backend/public/
USER node
EXPOSE 3000
CMD ["npm", "start", "--prefix", "./backend"]