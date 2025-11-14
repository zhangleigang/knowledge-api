# 安装和使用 GitHub CLI

## 📦 安装 GitHub CLI

### 方法1：安装 Homebrew 然后安装 gh（推荐）

```bash
# 1. 安装 Homebrew（如果还没安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 GitHub CLI
brew install gh

# 3. 验证安装
gh --version
```

### 方法2：直接下载安装包

1. 访问 https://cli.github.com/
2. 点击 "Download for macOS"
3. 下载 `.pkg` 文件并安装
4. 打开终端验证：`gh --version`

### 方法3：使用安装脚本

```bash
# 下载并安装
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg

# 安装
sudo apt install gh  # Ubuntu/Debian
# 或
sudo yum install gh  # CentOS
```

## 🚀 使用 GitHub CLI 上传项目

### 步骤1：登录 GitHub

```bash
gh auth login
```

按照提示选择：
1. `GitHub.com`
2. `HTTPS`
3. `Login with a web browser`
4. 复制显示的代码
5. 按回车打开浏览器
6. 粘贴代码并授权

### 步骤2：初始化 Git 仓库

```bash
cd knowledge-api
git init
git add .
git commit -m "Initial commit: 知识库 API 服务"
```

### 步骤3：创建 GitHub 仓库并推送

```bash
# 创建公开仓库
gh repo create knowledge-api --public --source=. --push

# 或创建私有仓库
gh repo create knowledge-api --private --source=. --push
```

完成！🎉

## ✅ 验证

```bash
# 查看仓库信息
gh repo view

# 在浏览器中打开仓库
gh repo view --web
```

## 📝 常用命令

```bash
# 查看仓库列表
gh repo list

# 克隆仓库
gh repo clone your-username/knowledge-api

# 创建 Issue
gh issue create

# 创建 Pull Request
gh pr create

# 查看帮助
gh --help
```

---

**安装完成后，回到终端继续上传！** 🚀
