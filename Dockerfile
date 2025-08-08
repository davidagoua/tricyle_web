
FROM node:22-alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
RUN npm run generate


FROM caddy:alpine AS deploy

COPY --from=build /app/dist/ /usr/share/caddy


COPY Caddyfile /etc/caddy/Caddyfile
