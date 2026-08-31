# awesome_script

一些适合放在 iPhone 主屏幕上的 Scripting App 脚本与组件。每个项目都可以单独导入，后续会持续加入更多实用或好玩的组件。

## 脚本目录

| 脚本 | 用途 | 导入链接 |
| --- | --- | --- |
| 快递取件码（Parcel Pickup Codes） | 通过系统短信自动化提取取件码并显示在主屏幕组件 | [复制 v4.1.0 导入链接](https://github.com/zhaomo08/awesome_script/tree/main/scripts/Parcel%20Pickup%20Codes) |
| Codex 额度安全版 | 查看 Codex 5 小时与每周额度，支持多账号和桌面组件 | [复制 GitHub 目录链接](https://github.com/zhaomo08/awesome_script/tree/main/scripts/Codex%20Quota%20Safe) |

在 iPhone 的 Scripting 导入页面中，粘贴表格里的 GitHub 目录链接即可导入。也可以下载 [`packages`](./packages) 目录中的 `.scripting` 文件，再用 Scripting App 打开。

## 使用前说明

- 快递取件码由系统快捷指令的“收到信息”自动化传入短信正文；只保存取件码、快递名称和时间，不发送网络请求。
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

本仓库脚本用于 [Scripting App](https://scripting.fun/)。Scripting 支持从 GitHub 仓库、仓库内的脚本目录或 ZIP 文件 URL 导入脚本。
