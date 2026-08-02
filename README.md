# 旅册

家庭共享旅行计划应用。保留行程、预订与联系人、装箱清单三个 Tab；静态界面由 Cloudflare Pages 托管，Pages Functions 提供家庭口令认证和 D1 持久化。

## 安全与数据

- 全站（除登录页/登录接口）要求登录；API 未登录返回 `401`
- 会话为 HMAC 签名、30 天有效的 `HttpOnly; Secure; SameSite=Strict` Cookie
- 家庭口令仅以 PBKDF2-SHA256 派生值配置，不写入仓库
- D1 使用单行 `trips` JSON 文档；服务端验证基本结构、最多 50 个旅行、最大 256 KiB
- 页面首次从云端读取。云端为空时读取 `lvce-v1` localStorage；没有本机数据时上传内置 seed。不迁移或兼容任何旧键。编辑后先存本机，再 700ms debounce 同步云端

## 本地开发

要求 Node.js 22+。

```bash
npm install
cp .dev.vars.example .dev.vars # 按注释填入值
npm run hash-password -- "你的家庭口令"
npx wrangler d1 execute lvce --local --file schema.sql
npx wrangler pages dev . --d1 DB=lvce
```

本地 Pages 地址通常为 <http://localhost:8788>。不要用普通静态服务器运行，否则 Functions 不可用。

## Cloudflare 首次部署

1. 创建 Pages 项目 `lvce` 和 D1 数据库 `lvce`。
2. 把 `wrangler.toml` 的 `LVCE_DB_ID` 替换成真实 D1 database ID。
3. 执行远程迁移：`npx wrangler d1 execute lvce --remote --file schema.sql`。
4. 生成口令派生值：`npm run hash-password -- "家庭口令"`。
5. 在 Pages 项目 **Settings → Variables and Secrets** 配置加密变量：
   - `FAMILY_PASSWORD_HASH`：上一步输出
   - `SESSION_SECRET`：至少 32 字节的密码学随机字符串（例如 `openssl rand -base64 48`）
6. GitHub 仓库 Actions secrets 配置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。Token 需有 Pages 编辑权限；远程初始化 D1 的操作者另需 D1 编辑权限。
7. 推送 `main` 或手动运行 Actions。工作流先测试、语法检查，再执行 Pages 部署。

仓库不包含实际口令、派生值、session secret 或 Cloudflare 凭据。

## 校验

```bash
npm test
npm run check
```
