# Card Tab - 个人导航书签页1

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Storage-KV-F38020?logo=cloudflare&logoColor=white" alt="KV">
  <img src="https://img.shields.io/badge/Build-esbuild-FFCF00?logo=esbuild&logoColor=black" alt="esbuild">
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

一个部署在 **Cloudflare Workers** 上的全栈导航书签页。使用 esbuild 模块化构建，GitHub Actions **全自动部署**，数据存储在 Cloudflare KV 中。

---

## 📢 最新更新 (v2.0.1)
- 🐛 **组件响应与下拉菜单修复**：彻底修复从单文件拆分至独立 `index.html` 时因 JavaScript 正则表达式转义引起的语法报错，恢复「本站」下拉菜单、「👤 设置」菜单与分类点击交互。
- 🌟 **开箱即用默认书签 (Seed Data)**：新增初次部署时的内置基础导航书签与美化 Empty State 引导，解决全新部署时主屏空白、无数据引导的问题。

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
  - **在线 / Iconify** — 输入 Iconify 图标标识符（如 `devicon:google`）或图片 URL，支持 [Iconify 图标库](https://icon-sets.iconify.design/) 在线浏览
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
- 👤 **用户名 + 密码登录** — 管理员用户名与密码双重认证
- 🔑 **明文变量可视化** — 部署后的 `ADMIN_USERNAME`、`ADMIN_PASSWORD`（默认 8 位随机密码）与 `JWT_SECRET`（默认 64 位随机串）在 Cloudflare 控制台直接以明文环境变量形式展示，便于管理员查看与调整，避免隐藏为“值已加密”
- 🎫 **JWT 双令牌** — Access Token（2h）+ Refresh Token（30天，HttpOnly Cookie）
- 🛡️ **登录限速** — 基于 IP 的速率限制，5 次失败锁定 15 分钟
- ⏱️ **时序安全** — 用户名与密码比较均使用恒定时间算法，防止计时攻击
- 🚪 **一键登出** — 递增 Key Generation 吊销所有已发 Token

### 📦 数据管理
- 💾 **智能备份** — 数据变更时自动备份，10 分钟内不重复备份，自动保留最近 10 份
- 📤 **数据导出** — 一键导出完整 JSON 数据
- 📥 **多格式导入** — 支持 Card Tab 原生 JSON、**Sun-Panel 导出 JSON**（自动检测转换）、Chrome / Edge 浏览器书签 HTML
- ⚡ **边缘缓存** — HTML 响应支持 ETag + Cloudflare 边缘缓存

---

## 🚀 部署指南

### GitHub Actions 全自动部署（推荐）

**一次配置，全自动完成**：KV 数据库创建、JWT 密钥生成、管理员账号设置、Worker 部署，全部由 CI 流水线自动处理，无需在 Cloudflare 控制台做任何额外配置。

#### 第一步：Fork 仓库

点击页面右上角 **Fork** 按钮，将本仓库 Fork 到你的 GitHub 账号下。

#### 第二步：获取 Cloudflare 密钥

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. **Account ID**：在控制台主页右侧边栏找到并复制
3. **API Token**：
   - 点击右上角头像 → **My Profile** → **API Tokens** → **Create Token**
   - 选择 **创建自定义令牌**（Create Custom Token），添加 **两条** 权限：

     | 资源类型 | 权限名称 | 操作 |
     |---------|---------|------|
     | 帐户 | **Workers KV 存储** | 编辑 |
     | 帐户 | **Worker 脚本** | 编辑 |

     > ⚠️ 注意：「Workers KV 存储」和「Worker 脚本」是 **两个不同的权限类别**，需要分别添加两行。

#### 第三步：设置 GitHub Repository Secrets

在 GitHub 项目仓库页面：
1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下必须变量：
   - `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare Account ID
   - `CLOUDFLARE_API_TOKEN`: 你的 Cloudflare API Token

*(可选)* 如果需要自定义登录账号密码与 JWT 密钥，可以额外配置：
- `ADMIN_USERNAME`: 管理员账号（未配置则默认 `admin`）
- `ADMIN_PASSWORD`: 管理员密码（未配置则默认生成 8 位随机密码）
- `JWT_SECRET`: JWT 签名密钥（未配置则默认生成 64 位随机密钥）

#### 第四步：自动部署与运行

1. 推送代码到 `main` 或 `master` 分支，或在 **Actions** 页面手动点击 **Run workflow**。
2. 部署成功后，展开 GitHub Actions 构建日志的 **Deployment Summary（部署摘要）** 步骤，即可看到为你生成的登录账号、密码及部署状态。
3. 部署完成后，在 Cloudflare Dashboard：**Workers & Pages** -> **card-tab** -> **Settings (设置)** -> **Variables (变量)** 中可以直接以明文方式查看/修改 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`。

---

## ❓ 常见报错与排查 (Troubleshooting)

### 报错：`Error: The process '/opt/hostedtoolcache/node/20.20.2/x64/bin/npx' failed with exit code 1`

**原因**：
Cloudflare 账号未初始化或开启 `*.workers.dev` 免费二级域名子域，导致 Wrangler 在尝试发布到默认 workers.dev 域名时失败退场。

**解决方案：绑定自定义域名（Custom Domain）**

为你部署的 Worker 绑定一个自己的域名，操作步骤如下：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，在左侧导航栏选择 **Workers 和 Pages (Workers & Pages)**。
2. 点击刚部署生成的 **`card-tab`** 服务进入详情页。
3. 切换到 **设置 (Settings)** 选项卡，然后点击左侧的 **触发器 (Triggers)**。
4. 在 **自定义域名 (Custom Domains)** 区域，点击 **添加自定义域名 (Add Custom Domain)** 按钮。
5. 输入你已托管在 Cloudflare 上的域名或子域名（例如：`nav.yourdomain.com`）。
6. 点击 **添加自定义域名** 确认，Cloudflare 会自动完成 DNS 解析与 SSL 证书配置（通常在 5 秒内生效）。
7. 绑定完成后，直接在浏览器访问你的自定义域名（如 `https://nav.yourdomain.com`）即可正常打开 Card Tab。

---

## ⚙️ 环境变量说明

| 变量名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| `JWT_SECRET` | Environment Variable / Secret | ✅ | JWT 签名密钥 | CI 自动生成 64 位随机串，在 CF 后台明文显示 |
| `ADMIN_USERNAME` | Environment Variable / Secret | ✅ | 管理员用户名 | `admin` ，在 CF 后台明文显示 |
| `ADMIN_PASSWORD` | Environment Variable / Secret | ✅ | 管理员登录密码 | CI 自动生成 8 位随机密码，在 CF 后台明文显示 |
| `CARD_ORDER` | KV Binding | ✅ | KV 命名空间绑定 | CI 自动创建并绑定 |
| `DEFAULT_USER` | Variable | ❌ | 默认用户标识 | `admin` |
| `ICON_API` | Variable | ❌ | 网站图标 API 地址 | `https://api.xinac.net/icon/?url=` |
| `PREFER_ICON_API` | Variable | ❌ | 是否优先使用图标 API | `true` |
| `ALLOWED_ORIGINS` | Variable | ❌ | CORS 允许的来源域名（逗号分隔） | 空（不启用 CORS） |

---

## 🎨 图标使用指南

Card Tab 支持多种图标设置方式：

### 在线 / Iconify 图标
输入 Iconify 图标标识符，格式为 `前缀:图标名`：
- `devicon:google` — Google 图标
- `logos:chrome` — Chrome Logo
- `mdi:home` — Material Design 主页图标
- `simple-icons:github` — GitHub 图标

👉 浏览完整图标库：[icon-sets.iconify.design](https://icon-sets.iconify.design/)

也可以直接输入图片 URL（如 `https://example.com/icon.png`），或留空由系统自动获取网站 favicon。

### 纯文字图标
输入 1-6 位文字或 Emoji，例如：
- 📺 — Emoji 图标
- 博客 — 中文文字图标
- AI — 字母图标

### 上传图片
点击「选择本地图片」上传 PNG/JPG/SVG 等格式图片（≤ 512KB），自动转为 Base64 存储。

---

## 📥 从 Sun-Panel 迁移

如果你之前使用的是 [Sun-Panel](https://github.com/hslr-s/sun-panel)，可以直接导入：

1. 在 Sun-Panel 中导出数据（JSON 格式）
2. 登录 Card Tab → 设置 → 导入数据
3. 选择 Sun-Panel 导出的 `.json` 文件
4. 系统自动检测格式并转换，无需手动处理

---

## 📁 项目结构

```
CardTab/
├── package.json              # 项目配置 + npm 脚本
├── build.js                  # esbuild 构建脚本
├── wrangler.toml             # Cloudflare Workers 部署配置
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 全自动部署流水线 (已修复语法)
├── src/
│   ├── worker.js             # Worker 入口：路由分发
│   ├── api/
│   │   ├── auth.js           # 登录/登出/Token 刷新与验证
│   │   ├── links.js          # 书签 CRUD
│   │   ├── backup.js         # 备份/导出/导入（含 Sun-Panel 转换）
│   │   └── icon.js           # 图标代理
│   ├── utils/                # 工具库
│   └── frontend/
│       └── index.html        # 前端 HTML 模板
└── dist/
    └── worker.js             # 构建产物（CI 自动生成）
```

---

## 📄 License

[MIT](LICENSE)
