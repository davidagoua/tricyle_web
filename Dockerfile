
FROM node:22-alpine AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build


FROM caddy:alpine AS deploy

COPY --from=build /app/.output/public /usr/share/caddy


COPY Caddyfile /etc/caddy/Caddyfile
