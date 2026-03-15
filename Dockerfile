# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]

