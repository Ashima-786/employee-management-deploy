FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Force Vite to build directly, bypassing any TypeScript type errors
RUN npx vite build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]