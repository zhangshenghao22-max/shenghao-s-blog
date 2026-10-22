# 清夏玖的个人网站

日漫电影感的海边夏日个人网站。主视觉是一张夏日海边的动画风背景：积雨云、海平线、沿海公路、电线杆和逆光；页面用深蓝、暖光、明朝体标题和半透明玻璃面板来延续这个场景。

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

- `/`：海边首页，包含电影感主视觉、个人终端三个入口、最近写下与最新记忆。
- `/about/`：我是谁？个人档案、Steam、番剧和游戏。
- `/memories/`：与你分享的记忆，照片、视频和图片放大查看。
- `/diary/`：日日不记，日记列表与详情页。
- `/admin/`：Decap CMS 后台。公开页面不再放置“写日记”入口，需要时可以直接访问这个地址。

页面会根据路由切换场景氛围：首页与档案是午后，记忆是金色黄昏，日记与详情是夏夜。

## 写日记和管理记忆

后台仍使用 `public/admin/config.yml`。日记会提交到 `src/content/diary/`，记忆会提交到 `src/content/memories/`，发布后由 GitHub Actions 自动部署。

只有 `zhangshenghao22-max` 可以登录发布后台。不要把 GitHub Secret 写进前端文件或仓库。

图片和本地视频上传到 `public/memories/assets/`；记忆中的视频也可以填写外部 URL。

## 视觉与动效

- 主视觉为 AI 生成的夏日海边场景（Flux），已裁切掉生成器水印并做调色；可以随时替换为授权插画。
- 动效全部用原生 CSS / 少量 JS 完成：Ken Burns 推镜、滚动视差、缓慢光线、云影、胶片颗粒、片头式白色光幕转场、横向片名信息带、玻璃面板的模糊淡入、卡片悬停、拍立得式图片放大。
- 移动端会关闭大范围视差和部分装饰；`prefers-reduced-motion` 下静态显示。
- 所有内容页在未启用 JavaScript 时仍然可读。

## 部署

推送到 `main` 后，`.github/workflows/deploy.yml` 会构建并发布到 GitHub Pages。当前自定义域名为 `https://www.zhangshenghao.com/`，域名记录位于 `public/CNAME`。

## OAuth Worker

Decap CMS 使用 `cloudflare/decap-oauth` 中的 Cloudflare Worker 代理 GitHub OAuth。敏感配置只放在 Cloudflare Worker 环境变量中，后台地址配置在 `public/admin/config.yml`。
