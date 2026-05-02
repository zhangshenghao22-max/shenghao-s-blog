# Decap CMS GitHub OAuth Worker

这个 Cloudflare Worker 给 `/admin/` 后台提供 GitHub OAuth 登录，并在发放 token 前校验 GitHub 用户名，只允许 `zhangshenghao22-max` 发布。

## 部署步骤

1. 在 GitHub 创建 OAuth App：
   - Application name: `日光微屿 CMS`
   - Homepage URL: `https://www.zhangshenghao.com`
   - Authorization callback URL: `https://你的-worker-地址/callback`
2. 进入本目录并登录 Cloudflare：

   ```bash
   cd cloudflare/decap-oauth
   npx wrangler login
   ```

3. 设置 Worker 环境变量和密钥：

   ```bash
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

   `wrangler.toml` 已内置：
   - `ALLOWED_GITHUB_LOGIN = "zhangshenghao22-max"`
   - `CMS_ORIGIN = "https://www.zhangshenghao.com"`

4. 部署 Worker：

   ```bash
   npx wrangler deploy
   ```

5. 把 `public/admin/config.yml` 里的 `backend.base_url` 改成真实 Worker 地址，例如：

   ```yml
   base_url: https://decap-oauth.你的账号.workers.dev
   ```

6. 提交并推送后，访问 `https://www.zhangshenghao.com/admin/` 测试登录和发布。

## 安全说明

- `GITHUB_CLIENT_SECRET` 只存在 Cloudflare Worker 环境变量里，不会进入前端代码。
- Worker 会调用 GitHub `/user` 接口确认登录账号，非 `zhangshenghao22-max` 会被拒绝。
- 当前仓库是公开仓库，因此 CMS 默认使用 `public_repo` 权限范围。
