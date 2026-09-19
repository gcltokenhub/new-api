#!/usr/bin/env bash
# 在华为云 ECS 上用指定 tag 的镜像重新部署 new-api（server + web）。
# 由 Jenkins 通过 ssh 调用：bash deploy-on-ecs.sh <IMAGE_TAG>   也可在 ECS 上手动执行。
#
# 做法与之前手工部署一致：
#   1. 拉取新镜像
#   2. 把正在跑的容器改名为 *-rollback-<旧tag> 并停掉（保留，随时能回滚）
#   3. 用新镜像按原参数起容器（配置来自 /etc/new-api/.env，本脚本不含任何密码）
#   4. 等健康检查通过；失败则自动回滚到旧容器
#   5. 只保留最近 3 个 rollback 版本，更旧的删掉
#
# 回滚：bash deploy-on-ecs.sh <旧tag>   （旧 tag 的镜像还在本机，秒级完成）
set -euo pipefail

TAG="${1:?用法: deploy-on-ecs.sh <IMAGE_TAG>}"
REG="swr.cn-east-3.myhuaweicloud.com/tokenhub"
SERVER_IMG="${REG}/new-api-server:${TAG}"
WEB_IMG="${REG}/new-api-web:${TAG}"
ENV_FILE=/etc/new-api/.env
KEEP_ROLLBACKS=3

log(){ echo "[$(date '+%F %T')] $*"; }

[[ -f $ENV_FILE ]] || { echo "error: $ENV_FILE 不存在" >&2; exit 1; }

# 当前跑的是哪个 tag（用于失败回滚）
OLD_TAG="$(docker inspect new-api-server --format '{{.Config.Image}}' 2>/dev/null | sed 's/.*://' || true)"
log "当前版本: ${OLD_TAG:-无}  →  目标版本: ${TAG}"
[[ "$OLD_TAG" == "$TAG" ]] && { log "已经是 ${TAG}，无需部署"; exit 0; }

log "拉取镜像"
docker pull -q "$SERVER_IMG"
docker pull -q "$WEB_IMG"

# 把旧容器让开（改名 + 停止，不删除）
retire() {  # retire <容器名>
  local c=$1
  if docker inspect "$c" >/dev/null 2>&1; then
    docker rename "$c" "${c}-rollback-${OLD_TAG}" 2>/dev/null || { docker rm -f "${c}-rollback-${OLD_TAG}" >/dev/null; docker rename "$c" "${c}-rollback-${OLD_TAG}"; }
    docker stop "${c}-rollback-${OLD_TAG}" >/dev/null
  fi
}

start_server() {  # start_server <镜像>
  docker run -d --name new-api-server --restart always --network host \
    --env-file "$ENV_FILE" \
    -v /data/new-api/requests:/data/requests \
    --stop-timeout 150 \
    --log-driver json-file --log-opt max-size=100m --log-opt max-file=5 \
    --health-cmd 'wget -q -O - http://localhost:3000/api/status | grep -q "\"success\": *true"' \
    --health-interval 30s --health-timeout 10s --health-retries 3 --health-start-period 30s \
    "$1" >/dev/null
}
start_web() {  # start_web <镜像>
  docker run -d --name new-api-web --restart always --network host \
    -e SERVER_UPSTREAM=127.0.0.1:3000 \
    --log-driver json-file --log-opt max-size=100m --log-opt max-file=5 \
    "$1" >/dev/null
}

wait_healthy() {  # 最多等 120 秒
  for _ in $(seq 1 60); do
    if curl -fs localhost/api/status 2>/dev/null | grep -q '"success": *true'; then return 0; fi
    sleep 2
  done
  return 1
}

log "停旧容器（保留为 rollback-${OLD_TAG}）"
retire new-api-web
retire new-api-server

log "启动 server ${TAG}"
start_server "$SERVER_IMG"
log "启动 web ${TAG}"
start_web "$WEB_IMG"

if wait_healthy; then
  log "健康检查通过 ✅  /api/status 正常"
else
  log "健康检查失败 ❌  自动回滚到 ${OLD_TAG}"
  docker logs --tail 50 new-api-server 2>&1 | sed 's/^/    server| /' || true
  docker rm -f new-api-web new-api-server >/dev/null 2>&1 || true
  if [[ -n "$OLD_TAG" ]]; then
    docker rename "new-api-server-rollback-${OLD_TAG}" new-api-server && docker start new-api-server >/dev/null
    docker rename "new-api-web-rollback-${OLD_TAG}"    new-api-web    && docker start new-api-web    >/dev/null
    wait_healthy && log "已回滚到 ${OLD_TAG}，服务正常" || log "回滚后仍不健康，请人工介入"
  fi
  exit 1
fi

# 清理过旧的 rollback 容器和镜像，只留最近 KEEP_ROLLBACKS 个
log "清理旧版本（保留最近 ${KEEP_ROLLBACKS} 个 rollback）"
docker ps -a --filter name='^new-api-server-rollback-' --format '{{.CreatedAt}}\t{{.Names}}' | sort | head -n -"$KEEP_ROLLBACKS" | cut -f2 | while read -r c; do
  t="${c#new-api-server-rollback-}"
  docker rm -f "$c" "new-api-web-rollback-${t}" >/dev/null 2>&1 || true
  docker rmi "${REG}/new-api-server:${t}" "${REG}/new-api-web:${t}" >/dev/null 2>&1 || true
  log "  已删除 ${t}"
done
docker image prune -f >/dev/null 2>&1 || true

log "部署完成: ${TAG}"
docker ps --filter name='^new-api-(server|web)$' --format '  {{.Names}}  {{.Image}}  {{.Status}}'
