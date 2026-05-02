---
title: "Astro 博客的静态轨道"
description: "为什么个人技术博客适合用 Astro：构建快、内容结构清晰、部署到 GitHub Pages 足够轻。"
pubDate: 2026-04-18
category: tech
tags: ["Astro", "静态站点", "GitHub Pages"]
cover: "/images/astro-orbit.svg"
coverAlt: "柔和浅色界面中的 Astro 静态站轨道图"
---

搭建个人技术博客时，我最关心的不是功能有多少，而是它能不能长期稳定地承载写作。Astro 的好处在于：默认输出静态页面，运行时负担很低，内容又可以直接用 Markdown 管理。

这意味着博客的大部分复杂度都留在构建阶段。页面上线之后，只是一组 HTML、CSS 和资源文件，天然适合 GitHub Pages 这样的静态托管环境。

## 内容优先

技术博客最重要的是让文章容易写、容易归档、容易被未来的自己找到。Astro Content Collections 可以给文章定义 schema，例如标题、日期、标签、摘要和封面图。这样每篇文章都有稳定的数据结构，而不是散落在模板里的字符串。

## 部署简单

GitHub Actions 负责构建，GitHub Pages 负责托管。每次推送到 `main` 分支后，workflow 自动执行 `npm run build`，再把 `dist` 目录发布出去。整个链路足够短，出问题时也容易排查。

我喜欢这种架构：它没有太多运行时魔法，但保留了足够的创作空间。对个人博客来说，这就是一条很稳的静态轨道。
