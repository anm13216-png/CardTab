# Card Tab - 个人导航书签页

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Storage-KV-F38020?logo=cloudflare&logoColor=white" alt="KV">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

一个部署在 **Cloudflare Workers** 上的全栈单文件导航书签页，前端和后端代码合并在一个 Worker 脚本中，数据存储在 Cloudflare KV 中。

## ✨ 功能特性

### 📌 导航管理
- 🗂️ **分类管理** — 支持创建、编辑、删除、隐藏书签分类
- 🔖 **书签卡片** — 以卡片形式展示网站书签，自动获取网站图标
- 🔀 **拖拽排序** — 支持 PC 和移动端触摸拖拽，自由排列卡片顺序
- 🔍 **全局搜索** — 快速搜索书签名称和链接
- 🌐 **网站状态** — 实时检测书签网站在线/离线/慢速状态

### 🎨 界面体验
- 🌓 **暗色模式** — 支持亮色/暗色主题自由切换
- 💎 **毛玻璃效果** — 现代化的玻璃态 UI 设计
- 📱 **响应式布局** — 完美适配桌面端和移动端
- ✨ **流畅动画** — 弹窗、下拉菜单等交互动画

### 🔐 安全特性
- 🔑 **密码登录** — 管理员密码认证
- 🎫 **JWT 双令牌** — Access Token（2h）+ Refresh Token（30天，HttpOnly Cookie）
- 🛡️ **登录限速** — 基于 IP 的速率限制，5 次失败锁定 15 分钟
- ⏱️ **时序安全** — 密码比较使用恒定时间算法，防止计时攻击
- 🚪 **一键登出** — 递增 Key Generation 吊销所有已发 Token

### 📦 数据管理
- 💾 **自动备份** — 数据变更时智能自动备份
- 📤 **数据导出** — 一键导出完整 JSON 数据
- 📥 **多格式导入** — 支持以下格式：
  - ✅ Card Tab 原生 JSON
  - ✅ **Sun-Panel 导出 JSON**（自动检测转换）
  - ✅ Chrome / Edge 浏览器书签 HTML
- ⚡ **边缘缓存** — HTML 响应支持 ETag + Cloudflare 边缘缓存

## 🚀 部署指南

### 前置条件

- 一个 [Cloudflare](https://dash.cloudflare.com/) 账号
- 安装 [Node.js](https://nodejs.org/)（≥ 16）和 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 第一步：创建 KV 命名空间

```bash
wrangler kv namespace create "CARD_ORDER"
```

记下输出的 `id`，后面要用。

### 第二步：配置 wrangler.toml

```toml
name = "card-tab"
main = "worker.js"
compatibility_date = "2024-09-01"

kv_namespaces = [
  { binding = "CARD_ORDER", id = "你的KV命名空间ID" }
]

[vars]
DEFAULT_USER = "admin"
ICON_API = "https://api.xinac.net/icon/?url="
PREFER_ICON_API = "true"
# ALLOWED_ORIGINS = "https://your-domain.com"  # 可选：限制 CORS 来源
```

### 第三步：配置 Secrets（敏感信息）

```bash
# JWT 密钥（≥ 32 字符的随机字符串）
wrangler secret put JWT_SECRET

# 管理员密码（≥ 8 字符）
wrangler secret put ADMIN_PASSWORD
```

### 第四步：部署

```bash
wrangler deploy
```

部署成功后访问 Worker 分配的 URL 即可使用。

## ⚙️ 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `JWT_SECRET` | ✅ | JWT 签名密钥，≥ 32 字符 |
| `ADMIN_PASSWORD` | ✅ | 管理员登录密码，≥ 8 字符 |
| `CARD_ORDER` | ✅ | KV 命名空间绑定 |
| `DEFAULT_USER` | ❌ | 默认用户标识（默认 `testUser`） |
| `ICON_API` | ❌ | 网站图标 API 地址 |
| `PREFER_ICON_API` | ❌ | 是否优先使用图标 API（默认 `true`） |
| `ALLOWED_ORIGINS` | ❌ | CORS 允许的来源域名 |

## 📥 从 Sun-Panel 迁移

如果你之前使用的是 [Sun-Panel](https://github.com/hslr-s/sun-panel)，可以直接导入：

1. 在 Sun-Panel 中导出数据（JSON 格式）
2. 登录 Card Tab → 设置 → 导入数据
3. 选择 Sun-Panel 导出的 `.json` 文件
4. 系统自动检测格式并转换，无需手动处理

**支持转换的内容：**
- ✅ 所有分组和书签
- ✅ 分组排序
- ✅ 书签名称、URL、描述
- ✅ 完整 URL 格式的图标
- ⚠️ Sun-Panel 内部上传的图标（`/uploads/...` 路径）无法迁移，Card Tab 会自动获取网站 favicon 替代

## 📁 项目结构

```
.
├── worker.js          # 完整的 Worker 脚本（前端 + 后端）
├── wrangler.toml      # Cloudflare Workers 部署配置
└── README.md          # 项目说明
```

## 🛠️ 技术栈

- **运行时**: Cloudflare Workers（V8 Isolates）
- **前端框架**: Tailwind CSS（CDN）
- **认证**: JWT（HMAC-SHA256）
- **存储**: Cloudflare KV
- **缓存**: ETag + Cloudflare Cache API

## 📄 License

[MIT](LICENSE)
