FROM node:20-slim AS node-build

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:20-slim AS node-runtime
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=node-build /app/backend/dist ./dist

FROM python:3.12-slim
RUN groupadd -r nirikshan && useradd -r -g nirikshan -d /app -s /sbin/nologin nirikshan
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/server.py ./backend/server.py
COPY --from=node-runtime --chown=nirikshan:nirikshan /app/backend /app/backend
RUN mkdir -p /var/log && chown -R nirikshan:nirikshan /var/log

USER nirikshan

ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 8080
CMD ["python", "-m", "uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8080"]
