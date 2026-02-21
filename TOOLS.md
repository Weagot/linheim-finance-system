# TOOLS.md - 本地配置笔记

## GitHub 仓库

- **仓库地址**: https://github.com/Weagot/linheim-finance-system
- **远程名称**: origin
- **默认分支**: main

## GitHub Token (认证配置)

- **Token**: 已配置到 ~/.git-credentials
- **存储位置**: ~/.git-credentials
- **配置方式**: `git config --global credential.helper store`

## 工作流程

1. **我负责**：
   - 开发功能
   - 本地测试验证
   - 提交并推送到 GitHub
   - 通知你进行 deploy

2. **你负责**：
   - 在 Vercel 触发 deploy
   - 进行系统自助测试
   - 反馈测试结果

## Git 常用命令

```bash
git push                              # 推送到 GitHub
git status                            # 查看状态
git log --oneline -10                 # 查看最近提交
git pull                              # 拉取更新
```
