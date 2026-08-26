# Codex 额度安全版

面向 iOS Scripting App 的自用 Codex 额度查看器。

## 安全调整

- 仅包含 Codex，不包含 Gemini、Claude、Grok。
- OAuth 使用 OpenAI 官方认证域名和 PKCE。
- Access Token、Refresh Token、ID Token 仅保存到 Scripting Keychain。
- 额度请求只连接 `chatgpt.com`，授权只连接 `auth.openai.com`。
- 强制 10 分钟最短请求间隔，即使连续点击刷新也优先读取缓存。
- 默认每 60 分钟刷新；界面只提供 30、60、120 分钟。
- 不在本机 Storage 中持久化服务端完整 JSON，只保留额度摘要。
- 使用独立 Keychain/Storage 键，不读取或覆盖原版 Codex Usage 数据。

## 导入与登录

1. 在 Minis 中下载 `Codex-Quota-Safe.scripting`。
2. 使用 Scripting App 打开并导入。
3. 运行“Codex 额度安全版”，点击“添加 Codex 账号”。
4. 在 OpenAI 官方页面完成登录。
5. 浏览器跳到 `http://localhost:1455/auth/callback?...` 且显示无法连接是正常现象。
6. 复制 Safari 地址栏中的完整 URL，返回脚本粘贴并验证。

回调 URL 含一次性授权码，不要截图、发送或长期保存。

## 小组件

添加 Scripting 主屏幕小组件，选择“Codex 额度安全版”。多账号时可把账号邮箱填入小组件参数；参数为空时使用默认账号。

## 注意

用量来自 ChatGPT/Codex 当前内部接口，不是公开稳定 API。OpenAI 可能调整接口或访问策略。本工具仅用于读取本人账号额度。
