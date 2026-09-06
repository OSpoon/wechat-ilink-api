# Changelog

本文件记录微信 iLink API 的重要变更。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 新增 Docker 一键安装脚本，自动下载发布配置、生成 `APP_KEY`、拉取镜像并启动服务。
- 安装脚本默认自动选择最新 GitHub Release，也支持通过 `--version` 固定安装版本。

### Changed

- 简化 README 和 API 文档中的部署说明，优先推荐一键安装流程。
- 安装脚本会保留已有 `.env` 和 `APP_KEY`，支持重复执行和自定义安装目录。

## [v0.0.1-beta.3] - 2026-09-06

### Added

- 增加管理控制台，支持登录、账号概览、微信账号绑定、账号详情和 Webhook 投递记录查看。
- 增加本地媒体存储和媒体发送、下载能力，支持图片、视频和文件。
- 增加 GHCR 发布镜像使用方式和生产环境 Compose 配置。
- 增加 API 与管理控制台的 Docker 构建、推送和 GitHub Release 自动化流程。

### Changed

- 完善消息、媒体、输入状态和 Webhook API 的实现与文档。
- 扩展 CI，覆盖格式检查、Lint、类型检查、测试、生产构建和 Compose 配置校验。

### Fixed

- 修复媒体接口与本地媒体副本处理中的兼容性问题。

## [v0.0.1-beta.2] - 2026-09-06

### Added

- 增加完整的 OpenAPI schema、Swagger UI 和 OpenAPI JSON 输出。
- 增加认证、微信账号、二维码登录、消息、媒体、输入状态和 Webhook 的功能测试覆盖。

### Changed

- 重构 API 路由、控制器和服务之间的集成方式。
- 统一 API 响应、错误处理和 OpenAPI 文档本地化行为。

## [v0.0.1-beta.1] - 2026-09-05

### Added

- 建立微信 iLink API 初始服务，包括 API 用户认证、二维码登录、微信账号管理、消息收发、媒体传输、输入状态和入站 Webhook。
- 增加 SQLite 数据持久化、账号连接管理、消息同步、限流和结构化请求日志。
- 增加 Docker 镜像、Docker Compose、本地开发配置和基础自动化测试。

### Changed

- 更新 Docker 工作流和运行时依赖，完成首个可部署的 beta 版本。

[Unreleased]: https://github.com/OSpoon/wechat-ilink-api/compare/v0.0.1-beta.3...HEAD
[v0.0.1-beta.3]: https://github.com/OSpoon/wechat-ilink-api/compare/v0.0.1-beta.2...v0.0.1-beta.3
[v0.0.1-beta.2]: https://github.com/OSpoon/wechat-ilink-api/compare/v0.0.1-beta.1...v0.0.1-beta.2
[v0.0.1-beta.1]: https://github.com/OSpoon/wechat-ilink-api/releases/tag/v0.0.1-beta.1
