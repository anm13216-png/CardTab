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
- 🖱️ **自定义右键菜单** — 右键卡片弹出操作菜单：
  - 打开链接（新标签页）
  - 复制链接
  - 打开内网链接 / 复制内网链接
  - 快速编辑
  - 删除

### ✏️ 高级编辑弹窗
- 🔗 **地址** — URL 输入 + ⚡ 一键获取网站图标
- 📝 **标题** — 名称输入 + 🔍 一键获取标题 + 实时字数统计
- 🎨 **图标** — 三种模式自由切换：
  - **在线 / Iconify** — 输入 Iconify 图标标识符（如 devicon:google）或图片 URL，支持 [Iconify 图标库](https://icon-sets.iconify.design/) 在线浏览
  - **纯文字** — 输入 1-6 位文字或 Emoji 作为图标
  - **上传图片** — 本地图片上传，自动转为 Base64 存储
- 👁️ **图标实时预览** — 编辑时即时预览图标效果
- 🌐 **内网地址** — 可选的内网 IP / 地址字段
- 📄 **描述信息** — 简短描述 + 实时字数统计
- 🗂️ **分类选择** — 下拉选择目标分类
- 🔒 **私密链接** — 设为仅登录可见

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

## 🤖 GitHub Actions 自动部署（推荐）

本项目已内置 GitHub Actions 工作流配置文件 (.github/workflows/deploy.yml)。只需在 GitHub 仓库中配置 2 个密钥，每次向 master 分支 git push 代码时，系统就会**全自动编译并部署**到你的 Cloudflare Workers。

### 配置步骤：

1. **获取 Cloudflare API Token**：
   - 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
   - 右上角头像 → **My Profile** → **API Tokens** → **Create Token**
   - 使用 **Edit Cloudflare Workers** 模板创建 Token 并复制。

2. **获取 Account ID**：
   - 在 Cloudflare 控制台右侧边栏找到 **Account ID** 并复制。

3. **在 GitHub 仓库添加 Secrets**：
   - 进入你的 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret** 添加以下两个变量：
     - CLOUDFLARE_API_TOKEN: 填入刚才创建的 API Token
     - CLOUDFLARE_ACCOUNT_ID: 填入你的 Account ID

设置完成后，以后每次你在本地提交代码或直接修改 GitHub 仓库代码，GitHub Actions 就会自动将项目部署到你的 Cloudflare Workers，无需在本地安装 Wrangler。

---

## 🚀 部署指南

### 前置条件

- 一个 [Cloudflare](https://dash.cloudflare.com/) 账号
- 安装 [Node.js](https://nodejs.org/)（≥ 16）和 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 第一步：创建 KV 命名空间

`ash
wrangler kv namespace create "CARD_ORDER"
`

记下输出的 id，后面要用。

### 第二步：配置 wrangler.toml

`	oml
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
`

### 第三步：配置 Secrets（敏感信息）

`ash
# JWT 密钥（≥ 32 字符的随机字符串）
wrangler secret put JWT_SECRET

# 管理员密码（≥ 8 字符）
wrangler secret put ADMIN_PASSWORD
`

### 第四步：部署

`ash
wrangler deploy
`

部署成功后访问 Worker 分配的 URL 即可使用。

## ⚙️ 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| JWT_SECRET | ✅ | JWT 签名密钥，≥ 32 字符 |
| ADMIN_PASSWORD | ✅ | 管理员登录密码，≥ 8 字符 |
| CARD_ORDER | ✅ | KV 命名空间绑定 |
| DEFAULT_USER | ❌ | 默认用户标识（默认 	estUser） |
| ICON_API | ❌ | 网站图标 API 地址 |
| PREFER_ICON_API | ❌ | 是否优先使用图标 API（默认 	rue） |
| ALLOWED_ORIGINS | ❌ | CORS 允许的来源域名 |

## 🎨 图标使用指南

Card Tab 支持多种图标设置方式：

### 在线 / Iconify 图标
输入 Iconify 图标标识符，格式为 前缀:图标名：
- devicon:google — Google 图标
- logos:chrome — Chrome Logo
- mdi:home — Material Design 主页图标
- simple-icons:github — GitHub 图标

👉 浏览完整图标库：[icon-sets.iconify.design](https://icon-sets.iconify.design/)

也可以直接输入图片 URL（如 https://example.com/icon.png），或留空由系统自动获取网站 favicon。

### 纯文字图标
输入 1-6 位文字或 Emoji，例如：
- 📺 — Emoji 图标
- 博客 — 中文文字图标
- AI — 字母图标

### 上传图片
点击「选择本地图片」上传 PNG/JPG/SVG 等格式图片（≤ 512KB），自动转为 Base64 存储。

## 📥 从 Sun-Panel 迁移

如果你之前使用的是 [Sun-Panel](https://github.com/hslr-s/sun-panel)，可以直接导入：

1. 在 Sun-Panel 中导出数据（JSON 格式）
2. 登录 Card Tab → 设置 → 导入数据
3. 选择 Sun-Panel 导出的 .json 文件
4. 系统自动检测格式并转换，无需手动处理

**支持转换的内容：**
- ✅ 所有分组和书签
- ✅ 分组排序
- ✅ 书签名称、URL、描述
- ✅ 完整 URL 格式的图标
- ⚠️ Sun-Panel 内部上传的图标（/uploads/... 路径）无法迁移，Card Tab 会自动获取网站 favicon 替代

## 📁 项目结构

`
.
├── worker.js          # 完整的 Worker 脚本（前端 + 后端）
├── wrangler.toml      # Cloudflare Workers 部署配置
└── README.md          # 项目说明
`

## 🛠️ 技术栈

- **运行时**: Cloudflare Workers（V8 Isolates）
- **前端框架**: Tailwind CSS（CDN）
- **认证**: JWT（HMAC-SHA256）
- **存储**: Cloudflare KV
- **缓存**: ETag + Cloudflare Cache API
- **图标服务**: [Iconify API](https://api.iconify.design/) + 自定义 Favicon API

## 📄 License

[MIT](LICENSE)
