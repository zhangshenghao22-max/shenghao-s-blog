# 清夏玖的博客

一个基于 Astro 和 GitHub Pages 的个人博客。当前版本采用简约苹果风和奶油玻璃拟态，内容包含生活文章、技术文章、个人简介、心情胶囊和灵感橱窗。

## 本地开发

```bash
npm install
npm run dev
```

常用命令：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 类型检查并构建静态站点 |
| `npm run preview` | 本地预览构建结果 |

## 网页一键发布文章

网站已新增站内后台：`https://www.zhangshenghao.com/admin/`。

发布流程：

1. 打开 `/admin/` 后台。
2. 点击 GitHub 登录。
3. 只有白名单账号 `zhangshenghao22-max` 可以通过认证。
4. 在后台新建文章、上传封面图、填写标题/摘要/分类/标签。
5. 点击发布后，Decap CMS 会直接提交到 `main` 分支。
6. GitHub Actions 自动构建并发布到 GitHub Pages。

后台由 Decap CMS 提供，GitHub 登录由 `cloudflare/decap-oauth` 中的 Cloudflare Worker 代理完成。不要把 `GITHUB_CLIENT_SECRET` 写进前端文件或仓库。


## 后台旧文章编辑排查

如果进入 `/admin/` 后点击已发布文章仍然看不到原内容，优先按下面步骤处理：

1. 在浏览器中对 `/admin/` 强制刷新（Windows 通常是 `Ctrl + F5`）。
2. 退出 Decap CMS 后重新登录，或使用无痕窗口打开 `/admin/`。
3. 若仍为空白，清理浏览器站点数据中 `www.zhangshenghao.com` 的 Local Storage / IndexedDB 后再登录。

当前 CMS 已关闭预览区、开启文章删除、把旧文章封面改为纯路径字段，并统一旧 Markdown 为 UTF-8 无 BOM，避免旧文章被编辑器解析失败。媒体目录已放宽到 `public/images`，旧封面和新上传图片都可以使用 `/images/...` 路径。

## 后台 OAuth 部署

首次启用 `/admin/` 前，需要部署 Cloudflare Worker 并创建 GitHub OAuth App。

1. 在 GitHub 创建 OAuth App：
   - Homepage URL: `https://www.zhangshenghao.com`
   - Authorization callback URL: `https://你的-worker-地址/callback`
2. 部署 Worker：

   ```bash
   cd cloudflare/decap-oauth
   npx wrangler login
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   npx wrangler deploy
   ```

3. 把 `public/admin/config.yml` 中的 `backend.base_url` 改成真实 Worker 地址。
4. 提交并推送，访问 `/admin/` 测试发布。

Worker 默认只允许 `zhangshenghao22-max` 发布；如需更换账号，修改 `cloudflare/decap-oauth/wrangler.toml` 中的 `ALLOWED_GITHUB_LOGIN` 后重新部署。

## 写一篇文章

推荐使用 `/admin/` 后台写文章。也可以手动在 `src/content/posts/` 新建 Markdown 或 MDX 文件。使用 `category` 区分生活和技术文章：

```md
---
title: "文章标题"
description: "一句简短摘要"
pubDate: 2026-05-01
category: life # life 或 tech
tags: ["日常", "咖啡"]
cover: "/images/example.svg"
coverAlt: "封面图描述"
draft: false
---

正文从这里开始。
```

图片可以放在 `public/images/`，后台上传的图片也会进入这个目录；在文章中用 `/images/文件名` 或 `/images/uploads/文件名` 引用。

## 站点结构

- `/`：首页，包含生活文章、技术文章、个人简介、心情胶囊和灵感橱窗。
- `/admin/`：文章发布后台，仅白名单 GitHub 账号可发布。
- `/menu/`：灵感菜单，汇总生活、技术、简介、归档和发布入口。
- `/archive/`：全部文章归档。
- `/about/`：个人简介页。

## GitHub Pages 发布

1. 在 GitHub 新建仓库，并把本地代码推送到 `main` 分支。
2. 进入仓库 Settings -> Pages。
3. Build and deployment 的 Source 选择 `GitHub Actions`。
4. 推送后等待 `Deploy to GitHub Pages` workflow 完成。
5. 当前仓库会发布到自定义域名 `https://www.zhangshenghao.com/`。

## 自定义域名

当前启用自定义域名 `www.zhangshenghao.com`，域名记录写在 `public/CNAME`，构建站点地址写在 `.github/workflows/deploy.yml` 和 `astro.config.mjs`。

推荐 DNS 配置：

- `www` 添加 `CNAME`，指向 `zhangshenghao22-max.github.io`
- 根域名如需同时访问，按 GitHub Pages 官方文档添加 apex `A` / `AAAA` 记录
- GitHub Pages 设置中开启 Enforce HTTPS

## 需要替换的个人信息

- 站点名称：`src/layouts/BaseLayout.astro`、`src/components/SiteHeader.astro`、`src/components/SiteFooter.astro`
- 关于页内容和链接：`src/pages/about.astro`
- 首页模块：`src/pages/index.astro`
- 示例文章：`src/content/posts/`
- 自定义域名：`https://www.zhangshenghao.com/`
- 后台 OAuth Worker 地址：`public/admin/config.yml`
