#!/usr/bin/env bash

set -Eeuo pipefail

readonly DEFAULT_VERSION="latest"
readonly DEFAULT_INSTALL_DIR="./wechat-ilink-api"
readonly REPOSITORY="OSpoon/wechat-ilink-api"

VERSION="${VERSION:-$DEFAULT_VERSION}"
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
START_SERVICES=true
FORCE_DOWNLOAD=false

usage() {
  cat <<'EOF'
微信 iLink API 一键安装脚本

用法：
  curl -fsSL https://raw.githubusercontent.com/OSpoon/wechat-ilink-api/main/install.sh | bash

选项：
  --version VERSION  安装指定版本，例如 v0.0.1-beta.2；默认自动选择最新 Release
  --dir DIRECTORY    安装目录，默认 ./wechat-ilink-api
  --no-start         只下载并生成配置，不启动容器
  --force            覆盖安装目录中已有的 Compose 配置和 .env.example
  -h, --help         显示帮助

也可以通过 VERSION 和 INSTALL_DIR 环境变量传入默认值。
EOF
}

fail() {
  echo "错误：$*" >&2
  exit 1
}

while (($# > 0)); do
  case "$1" in
    --version)
      (($# >= 2)) || fail "--version 需要一个版本号"
      VERSION="$2"
      shift 2
      ;;
    --dir)
      (($# >= 2)) || fail "--dir 需要一个目录"
      INSTALL_DIR="$2"
      shift 2
      ;;
    --no-start)
      START_SERVICES=false
      shift
      ;;
    --force)
      FORCE_DOWNLOAD=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "未知选项：$1（使用 --help 查看用法）"
      ;;
  esac
done

download() {
  local url="$1"
  local destination="$2"

  if command -v curl >/dev/null 2>&1; then
    curl --fail --silent --show-error --location --retry 3 --output "$destination" "$url"
  elif command -v wget >/dev/null 2>&1; then
    wget --quiet --output-document="$destination" "$url"
  else
    fail "未找到 curl 或 wget，无法下载安装文件"
  fi
}

resolve_latest_version() {
  local releases
  local latest_version
  local releases_url="https://api.github.com/repos/${REPOSITORY}/releases?per_page=1"

  if command -v curl >/dev/null 2>&1; then
    releases="$(curl --fail --silent --show-error --location --retry 3 \
      --header 'Accept: application/vnd.github+json' \
      --header 'User-Agent: wechat-ilink-api-installer' \
      "$releases_url")"
  else
    releases="$(wget --quiet --output-document=- "$releases_url")"
  fi

  latest_version="$(printf '%s\n' "$releases" | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  [[ -n "$latest_version" ]] || fail "无法从 GitHub 获取最新 Release，请使用 --version 指定版本"
  printf '%s' "$latest_version"
}

command -v docker >/dev/null 2>&1 || fail "未找到 Docker，请先安装 Docker Desktop 或 Docker Engine"
docker compose version >/dev/null 2>&1 || fail "未找到 Docker Compose，请升级到支持 'docker compose' 的 Docker 版本"
command -v openssl >/dev/null 2>&1 || fail "未找到 openssl，无法自动生成 APP_KEY"
command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || fail "未找到 curl 或 wget，无法下载安装文件"

if [[ "$VERSION" == "latest" ]]; then
  echo "查询最新发布版本..."
  VERSION="$(resolve_latest_version)"
fi

case "$VERSION" in
  v*) ;;
  *) VERSION="v$VERSION" ;;
esac

case "$VERSION" in
  *[![:alnum:]._-]*) fail "版本号格式无效：$VERSION" ;;
esac

readonly RAW_BASE_URL="${RAW_BASE_URL:-https://raw.githubusercontent.com/${REPOSITORY}/${VERSION}}"
readonly COMPOSE_FILE="$INSTALL_DIR/docker-compose.yml"
readonly ENV_EXAMPLE_FILE="$INSTALL_DIR/.env.example"
readonly ENV_FILE="$INSTALL_DIR/.env"

echo "正在安装微信 iLink API ${VERSION}..."
mkdir -p "$INSTALL_DIR/data/media"

if [[ ! -e "$COMPOSE_FILE" || "$FORCE_DOWNLOAD" == true ]]; then
  echo "下载 Docker Compose 配置..."
  download "${RAW_BASE_URL}/docker-compose.ghcr.yml" "$COMPOSE_FILE"
else
  echo "已保留现有 $COMPOSE_FILE"
fi

if [[ ! -e "$ENV_EXAMPLE_FILE" || "$FORCE_DOWNLOAD" == true ]]; then
  echo "下载环境变量模板..."
  download "${RAW_BASE_URL}/.env.example" "$ENV_EXAMPLE_FILE"
else
  echo "已保留现有 $ENV_EXAMPLE_FILE"
fi

if [[ ! -e "$ENV_FILE" ]]; then
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
  echo "已创建 $ENV_FILE"
fi

existing_app_key="$(awk -F= '/^APP_KEY=/{print substr($0, index($0, "=") + 1); exit}' "$ENV_FILE")"
if [[ -z "$existing_app_key" ]]; then
  generated_app_key="$(openssl rand -hex 32)"
  env_tmp_file="$(mktemp "${ENV_FILE}.tmp.XXXXXX")"
  awk -v app_key="$generated_app_key" '
    BEGIN { replaced = 0 }
    /^APP_KEY=/ { print "APP_KEY=" app_key; replaced = 1; next }
    { print }
    END { if (!replaced) print "APP_KEY=" app_key }
  ' "$ENV_FILE" > "$env_tmp_file"
  mv "$env_tmp_file" "$ENV_FILE"
  echo "已自动生成 APP_KEY（已写入 ${ENV_FILE}）"
else
  echo "已保留现有 APP_KEY"
fi

chmod 600 "$ENV_FILE"

if [[ "$START_SERVICES" == true ]]; then
  echo "拉取 Docker 镜像..."
  if ! (cd "$INSTALL_DIR" && IMAGE_TAG="${VERSION#v}" docker compose pull); then
    fail "镜像拉取失败，请检查网络、版本和当前 CPU 架构；只有私有仓库才需要额外执行 docker login ghcr.io。"
  fi

  echo "启动服务..."
  (cd "$INSTALL_DIR" && IMAGE_TAG="${VERSION#v}" docker compose up -d)

  cat <<EOF

安装完成。

API：      http://localhost:13333
管理控制台：http://localhost:18080
Swagger：  http://localhost:13333/docs
安装目录：  $INSTALL_DIR

查看日志：cd "$INSTALL_DIR" && docker compose logs -f api
停止服务：cd "$INSTALL_DIR" && docker compose down
EOF
else
  cat <<EOF

文件准备完成，尚未启动容器。

安装目录：$INSTALL_DIR
启动服务：cd "$INSTALL_DIR" && IMAGE_TAG="${VERSION#v}" docker compose up -d
EOF
fi
