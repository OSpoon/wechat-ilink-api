# 贡献与发布指南

本文面向项目维护者和贡献者。API 使用者请先阅读 [README](./README.md) 和 [微信 iLink API 参考](./docs/weixin-api.md)。

## 开发环境

- Node.js 24 或更高版本
- pnpm 10.15.1

项目已在 `package.json` 中声明 pnpm 版本。首次准备环境时执行：

```bash
corepack enable
corepack prepare pnpm@10.15.1 --activate
pnpm install
pnpm exec simple-git-hooks
```

如果提交时出现 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`，说明当前 shell 使用了与项目不一致的 pnpm 版本。重新执行上述命令即可，不要通过永久设置 `CI=true` 或 `confirmModulesPurge=false` 绕过依赖版本检查。

## 本地质量检查

提交前 Git hooks 会自动执行：

- `pre-commit`：使用 `lint-staged` 对暂存的 JavaScript/TypeScript、JSON、Markdown 和 YAML 文件执行格式化和 Lint。
- `pre-push`：执行 `pnpm check && pnpm typecheck:admin`，检查格式、ESLint、后端 TypeScript 类型和 admin TypeScript 类型。

手动执行完整检查：

```bash
pnpm check
pnpm test
pnpm build
```

也可以执行完整验证命令：

```bash
pnpm verify
```

## GitHub Actions

### CI

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) 在向 `main` 推送或创建针对 `main` 的 Pull Request 时执行：

1. 安装依赖
2. 检查格式
3. 执行 ESLint
4. 执行 TypeScript 类型检查
5. 执行测试
6. 执行生产构建

### Docker 镜像与 GitHub Release

[`.github/workflows/docker-image.yml`](./.github/workflows/docker-image.yml) 监听 `vX.Y.Z` 格式的 tag，并将 API 与 admin 两个镜像推送到 GitHub Container Registry。两个镜像成功推送后，Workflow 才会创建对应的 GitHub Release，并自动生成变更说明。

生产部署可以下载对应版本的 [`docker-compose.ghcr.yml`](./docker-compose.ghcr.yml) 后直接使用已发布镜像；本地开发和验收继续使用 [`docker-compose.yml`](./docker-compose.yml) 进行构建。

## 发布

发布前确保工作区已经提交并且干净，然后执行唯一的发布命令：

```bash
pnpm release
```

该命令会先执行 `pnpm verify`，再通过 bumpp：

- 检查工作区状态
- 更新 `package.json` 版本
- 创建版本提交
- 创建 `vX.Y.Z` tag
- 推送提交和 tag

tag 推送后，Docker workflow 会依次完成镜像构建、镜像推送和 GitHub Release 创建。

首次启用发布前，在 GitHub 仓库确认：

- Actions 已启用。
- Settings → Actions → General → Workflow permissions 允许 `GITHUB_TOKEN` 读写仓库内容。
- 当前发布账号可以向发布分支推送提交和 tag。
- GHCR 镜像可见性符合预期。

Workflow 已声明 `contents: write` 和 `packages: write`，不需要额外配置 Docker Hub Secret。私有 GHCR 镜像的拉取权限需要由使用方自行提供具备 `read:packages` 权限的令牌。
