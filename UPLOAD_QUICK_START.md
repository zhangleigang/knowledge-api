# 🚀 快速上传到 GitHub

## 方法1：使用自动化脚本（最简单）

```bash
# 1. 进入项目目录
cd knowledge-api

# 2. 运行上传脚本（替换成你的 GitHub 用户名）
./upload-to-github.sh your-username

# 3. 按照提示操作即可
```

脚本会自动完成：
- ✅ 初始化 Git 仓库
- ✅ 创建 .gitignore
- ✅ 添加并提交文件
- ✅ 配置远程仓库
- ✅ 推送到 GitHub

## 方法2：手动上传（3步完成）

### 步骤1：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. Repository name: `knowledge-api`
3. 点击 `Create repository`

### 步骤2：初始化本地仓库

```bash
cd knowledge-api
git init
git add .
git commit -m "Initial commit: 知识库 API 服务"
```

### 步骤3：推送到 GitHub

```bash
# 替换成你的 GitHub 用户名
git remote add origin https://github.com/your-username/knowledge-api.git
git branch -M main
git push -u origin main
```

## 方法3：使用 GitHub CLI（最快）

```bash
# 1. 安装 GitHub CLI (首次使用)
brew install gh  # macOS
# 或访问 https://cli.github.com/ 下载

# 2. 登录
gh auth login

# 3. 一键创建并上传
cd knowledge-api
git init
git add .
git commit -m "Initial commit: 知识库 API 服务"
gh repo create knowledge-api --public --source=. --push
```

## ✅ 验证上传成功

访问你的仓库：`https://github.com/your-username/knowledge-api`

应该能看到所有文件！

## 📝 后续更新

修改代码后：

```bash
git add .
git commit -m "描述你的修改"
git push
```

## 🆘 遇到问题？

查看详细文档：[GITHUB_UPLOAD.md](./GITHUB_UPLOAD.md)

---

**选择一个方法开始吧！** 🎉
