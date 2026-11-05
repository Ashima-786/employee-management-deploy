FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_SUPABASE_PROJECT_ID=oyzhfgvdndiljxosibjm
ARG VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_EfaCTghUb16MKe_k52QjrQ_1N-LvUBX
ARG VITE_SUPABASE_URL=https://oyzhfgvdndiljxosibjm.supabase.co
ARG VITE_API_URL=http://13.60.211.165:5000/api

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_API_URL=$VITE_API_URL \
    NITRO_PRESET=node-server

RUN npm pkg set scripts.build="vite build"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

COPY --from=builder /app/.output ./.output

EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
