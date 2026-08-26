# awesome_script

一些适合放在 iPhone 主屏幕上的 Scripting App 脚本与组件。每个项目都可以单独导入，后续会持续加入更多实用或好玩的组件。

## 脚本目录

| 脚本 | 用途 | 手机导入 |
| --- | --- | --- |
| 快递进度汇总（ParcelBoard） | 汇总多件快递的承运商、状态、最新轨迹和更新时间 | [一键导入](https://scripting.fun/import_scripts?urls=%5B%22https%3A%2F%2Fgithub.com%2Fzhaomo08%2Fawesome_script%2Ftree%2Fmain%2Fscripts%2FParcelBoard%22%5D) |
| Codex 额度安全版 | 查看 Codex 5 小时与每周额度，支持多账号和桌面组件 | [一键导入](https://scripting.fun/import_scripts?urls=%5B%22https%3A%2F%2Fgithub.com%2Fzhaomo08%2Fawesome_script%2Ftree%2Fmain%2Fscripts%2FCodex%2520Quota%2520Safe%22%5D) |

如果微信等内置浏览器没有拉起 Scripting，请在 Safari 中打开链接。也可以下载 [`packages`](./packages) 目录中的 `.scripting` 文件，再用 Scripting App 打开。

## 使用前说明

- 快递进度汇总需要你自己的快递100 `customer` 和 `key`，密钥与运单只保存在本机 Scripting 私有存储中。
- Codex 额度组件通过 OpenAI OAuth PKCE 登录，Token 只保存在本机 Keychain；用量数据来自当前内部接口，OpenAI 调整接口后可能需要更新脚本。
- 仓库不会包含账号 Token、快递 API 密钥或个人运单数据。

## 仓库结构

```text
scripts/    可读、可修改的脚本源码
packages/   可分享给手机的 .scripting 安装包
tools/      打包工具
```

每个脚本是一个独立目录，至少包含 `script.json` 和入口文件。新增脚本与重新打包方法见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## Scripting App

本仓库脚本用于 [Scripting App](https://scripting.fun/)。链接导入使用官方 `import_scripts` URL Scheme。
