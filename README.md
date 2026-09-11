# 清夏玖的个人网站

基于 Astro 和 GitHub Pages 的个人网站，用来分享生活、记忆与日常。页面采用白色留白、柔和光影和轻盈的原生动效。

## 本地开发

```powershell
npm install
npm run dev
```

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并构建 |
| `npm run preview` | 预览构建结果 |

## 页面

- `/`：欢迎页与三个主要入口。
- `/about/`：我是谁？
- `/memories/`：与你分享的记忆，支持照片、视频和文字介绍。
- `/diary/`：日日不记，公开展示日记。
- `/admin/`：日记和记忆的网页发布后台。

## 写日记和管理记忆

打开 `/admin/`，使用白名单 GitHub 账号登录。日记会提交到 `src/content/diary/`，记忆会提交到 `src/content/memories/`，发布后由 GitHub Actions 自动部署。

只有 `zhangshenghao22-max` 可以登录发布后台。不要把 GitHub Secret 写进前端文件或仓库。

图片和本地视频上传到 `public/memories/assets/`；记忆中的视频也可以填写外部 URL。

日记示例：

```md
---
title: 日记标题
description: 一句简短摘要
pubDate: 2026-09-11
cover: /memories/assets/example.jpg
coverAlt: 封面说明
tags: [日常]
draft: false
---

正文从这里开始。
```

## 动效与性能

动效使用原生 CSS 和少量 IntersectionObserver。内容只有进入视口时才播放，背景动画在页面不可见时不运行；移动端、低性能设备和 `prefers-reduced-motion` 会自动降级。

## 部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并发布到 GitHub Pages。当前自定义域名为 `https://www.zhangshenghao.com/`，域名记录位于 `public/CNAME`。

## OAuth Worker

Decap CMS 使用 `cloudflare/decap-oauth` 中的 Cloudflare Worker 代理 GitHub OAuth。敏感配置只放在 Cloudflare Worker 环境变量中，后台地址配置在 `public/admin/config.yml`。
