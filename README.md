# 清夏玖的个人网站

海边夏日主题的个人网站。整体是一幅用 CSS + SVG 手绘的海边场景：正午的积雨云、海平线、小岛、海浪、沙滩、遮阳伞、西瓜和拖鞋；页面里的内容则做成漫画分镜、手帐、拍立得和纸胶带的质感。

视觉参考只用于构图与色感，没有使用这些页面的图片素材：

- [Anime Summer Veranda Ocean View](https://www.wallpaperalchemy.com/wallpaper/anime-summer-veranda-ocean-view-wallpaper-1689)
- [Anime Beach Paradise](https://stockcake.com/i/anime-beach-paradise_3864162_1765772)

## 本地开发

需要 Node.js 22.12 或更高版本。

```powershell
npm ci
npm run dev
```

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并构建 |
| `npm run preview` | 预览构建结果 |

## 页面

- `/`：海边首页，包含主视觉、个人终端三个入口、最近写下与最新记忆。
- `/about/`：我是谁？个人档案、Steam、番剧和游戏。
- `/memories/`：与你分享的记忆，照片、视频和图片放大查看。
- `/diary/`：日日不记，日记列表与详情页。
- `/admin/`：Decap CMS 后台。公开页面不再放置“写日记”入口，需要时可以直接访问这个地址。

页面会根据当前路由切换光线：首页正午、档案午后、记忆黄昏、日记与详情夏夜。

## 写日记和管理记忆

后台仍使用 `public/admin/config.yml`。日记会提交到 `src/content/diary/`，记忆会提交到 `src/content/memories/`，发布后由 GitHub Actions 自动部署。

只有 `zhangshenghao22-max` 可以登录发布后台。不要把 GitHub Secret 写进前端文件或仓库。

图片和本地视频上传到 `public/memories/assets/`；记忆中的视频也可以填写外部 URL。

## 视觉与动效

- 场景由 CSS 和 SVG 绘制，不依赖第三方插画；海浪纹理使用 `public/memories/assets/ocean-texture.webp`（由站点原有的 `ocean-backdrop.jpg` 压缩生成）。
- 动效包括：卷帘式海浪转场、滚动视差、海浪/云/海鸥/小船循环、卷轴式信息条、卡片翻起、拍立得放大、鼠标经过海面时的光斑。
- 移动端会关闭前景道具和大部分装饰动画；`prefers-reduced-motion` 下会静态显示。

## 部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并发布到 GitHub Pages。当前自定义域名为 `https://www.zhangshenghao.com/`，域名记录位于 `public/CNAME`。

## OAuth Worker

Decap CMS 使用 `cloudflare/decap-oauth` 中的 Cloudflare Worker 代理 GitHub OAuth。敏感配置只放在 Cloudflare Worker 环境变量中，后台地址配置在 `public/admin/config.yml`。
