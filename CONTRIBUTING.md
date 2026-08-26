# 添加新脚本

1. 在 `scripts/` 下创建独立目录，目录中至少包含 `script.json` 与 `index.tsx`。
2. 小组件入口使用 `widget.tsx`，交互按钮可放在 `app_intents.tsx`。
3. 不要提交 Token、Cookie、API Key、账号、运单或其他个人数据。
4. 在根目录运行 `./tools/package.sh`，重新生成 `packages/*.scripting`。
5. 在根 README 的脚本目录中加入说明和一键导入链接。

脚本的 `remoteResource.url` 应指向其 GitHub 目录，这样导入来源清晰，也便于后续更新。
