FROM hub.siji.ci/library/node:20 AS frontend
RUN npm config set registry 'https://registry.npmmirror.com/'
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install && pnpm run build

FROM hub.siji.ci/library/golang:1.21 AS builder
WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct

COPY . .
COPY --from=frontend /app/out /app/out
RUN CGO_ENABLED=0 go build -o movie-sync-server

FROM hub.siji.ci/library/debian:bullseye-slim
COPY --from=builder /app/movie-sync-server /app/
WORKDIR /app
CMD ["/app/movie-sync-server"]
