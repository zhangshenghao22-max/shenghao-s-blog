# 日光微屿

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

## 写一篇文章

在 `src/content/posts/` 新建 Markdown 或 MDX 文件。使用 `category` 区分生活和技术文章：

```md
---
title: "文章标题"
description: "一句简短摘要"
pubDate: 2026-05-01
category: life # life 或 tech
tags: ["日常", "咖啡"]
cover: "/images/example.svg"
coverAlt: "封面图描述"
---

正文从这里开始。
```

图片可以放在 `public/images/`，在文章中用 `/images/文件名` 引用。

## 站点结构

- `/`：首页，包含生活文章、技术文章、个人简介、心情胶囊和灵感橱窗。
- `/menu/`：灵感菜单，汇总生活、技术、简介、归档和 GitHub 入口。
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
