# 纸上有风

一个基于 Astro 和 GitHub Pages 的个人生活随笔博客。第一版采用纸张杂志感设计，专注文章阅读、归档和关于页。

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

在 `src/content/posts/` 新建 Markdown 或 MDX 文件：

```md
---
title: "文章标题"
description: "一句简短摘要"
pubDate: 2026-05-01
tags: ["日常", "城市"]
cover: "/images/example.svg"
coverAlt: "封面图描述"
---

正文从这里开始。
```

图片可以放在 `public/images/`，在文章中用 `/images/文件名` 引用。

## GitHub Pages 发布

1. 在 GitHub 新建仓库，并把本地代码推送到 `main` 分支。
2. 进入仓库 Settings → Pages。
3. Build and deployment 的 Source 选择 `GitHub Actions`。
4. 推送后等待 `Deploy to GitHub Pages` workflow 完成。
5. 当前仓库会先发布到 `https://zhangshenghao22-max.github.io/shenghao-s-blog/`。如果以后使用自定义域名，再新增 `public/CNAME`。

## 自定义域名

当前没有启用自定义域名，默认发布到 GitHub Pages 项目地址。以后如需绑定域名，请新增 `public/CNAME`，并同步修改 `.github/workflows/deploy.yml` 中的 `SITE_URL` 和 `astro.config.mjs` 默认站点地址。

推荐 DNS 配置：

- `www` 添加 `CNAME`，指向 `username.github.io`
- 根域名如需同时访问，按 GitHub Pages 官方文档添加 apex `A` / `AAAA` 记录
- GitHub Pages 设置中开启 Enforce HTTPS

## 需要替换的个人信息

- 站点名称：`src/layouts/BaseLayout.astro`、`src/components/SiteHeader.astro`、`src/components/SiteFooter.astro`
- 关于页内容和链接：`src/pages/about.astro`
- 示例文章：`src/content/posts/`
- GitHub Pages 地址：`https://zhangshenghao22-max.github.io/shenghao-s-blog/`

