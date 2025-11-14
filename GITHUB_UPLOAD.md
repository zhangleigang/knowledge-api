# GitHub 上传指南

## 📋 准备工作

### 1. 确保已安装 Git

```bash
# 检查 Git 版本
git --version

# 如果没有安装，请先安装
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# CentOS
sudo yum install git
```

### 2. 配置 Git（首次使用）

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 🚀 上传步骤

### 方法1：使用 GitHub 网页创建仓库（推荐）

#### 步骤1：在 GitHub 创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - Repository name: `knowledge-api`
   - Description: `面试知识库 API 服务`
   - 选择 `Public` 或 `Private`
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 `Create repository`

#### 步骤2：在本地初始化并上传

```bash
# 1. 进入项目目录
cd knowledge-api

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 查看将要提交的文件
git status

# 5. 提交
git commit -m "Initial commit: 知识库 API 服务"

# 6. 添加远程仓库（替换成你的 GitHub 用户名）
git remote add origin https://github.com/your-username/knowledge-api.git

# 7. 推送到 GitHub
git push -u origin main

# 如果提示 main 分支不存在，使用 master
git branch -M main
git push -u origin main
```

### 方法2：使用 GitHub CLI（更简单）

```bash
# 1. 安装 GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 2. 登录 GitHub
gh auth login

# 3. 进入项目目录
cd knowledge-api

# 4. 初始化并创建仓库
git init
git add .
git commit -m "Initial commit: 知识库 API 服务"

# 5. 创建 GitHub 仓库并推送（一条命令完成）
gh repo create knowledge-api --public --source=. --push

# 或创建私有仓库
gh repo create knowledge-api --private --source=. --push
```

## ✅ 验证上传

### 1. 检查远程仓库

```bash
git remote -v
```

应该显示：
```
origin  https://github.com/your-username/knowledge-api.git (fetch)
origin  https://github.com/your-username/knowledge-api.git (push)
```

### 2. 访问 GitHub 仓库

打开浏览器访问：`https://github.com/your-username/knowledge-api`

应该能看到所有文件已上传。

## 📝 后续更新

### 修改代码后提交

```bash
# 1. 查看修改
git status

# 2. 添加修改的文件
git add .

# 3. 提交
git commit -m "描述你的修改"

# 4. 推送到 GitHub
git push
```

### 常用 Git 命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull

# 创建新分支
git checkout -b feature-name

# 切换分支
git checkout main

# 合并分支
git merge feature-name
```

## 🔐 使用 SSH 密钥（推荐）

使用 SSH 可以避免每次都输入密码。

### 1. 生成 SSH 密钥

```bash
# 生成密钥（按提示操作，可以直接回车使用默认值）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加密钥
ssh-add ~/.ssh/id_ed25519
```

### 2. 添加公钥到 GitHub

```bash
# 复制公钥
cat ~/.ssh/id_ed25519.pub
# 或 macOS 可以直接复制到剪贴板
pbcopy < ~/.ssh/id_ed25519.pub
```

1. 登录 GitHub
2. 点击头像 → Settings
3. 左侧菜单 → SSH and GPG keys
4. 点击 `New SSH key`
5. 粘贴公钥，点击 `Add SSH key`

### 3. 修改远程仓库地址为 SSH

```bash
# 查看当前远程地址
git remote -v

# 修改为 SSH 地址
git remote set-url origin git@github.com:your-username/knowledge-api.git

# 验证
git remote -v
```

现在推送时就不需要输入密码了：
```bash
git push
```

## 📦 创建 Release

### 1. 打标签

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签
git push origin v1.0.0

# 或推送所有标签
git push --tags
```

### 2. 在 GitHub 创建 Release

1. 访问仓库页面
2. 点击右侧 `Releases`
3. 点击 `Create a new release`
4. 选择标签 `v1.0.0`
5. 填写 Release 标题和说明
6. 点击 `Publish release`

## 🔄 克隆到其他电脑

```bash
# 克隆仓库
git clone https://github.com/your-username/knowledge-api.git

# 进入目录
cd knowledge-api

# 安装依赖
npm install

# 准备数据
# 将 knowledge.js 放到 utils/ 目录
node convert-data.js

# 启动服务
npm start
```

## 🌿 分支管理策略

### 推荐的分支结构

```
main (或 master)     # 主分支，稳定版本
├── develop          # 开发分支
├── feature/xxx      # 功能分支
└── hotfix/xxx       # 紧急修复分支
```

### 创建和使用分支

```bash
# 创建开发分支
git checkout -b develop

# 创建功能分支
git checkout -b feature/add-search

# 完成功能后合并到 develop
git checkout develop
git merge feature/add-search

# 删除功能分支
git branch -d feature/add-search

# 发布时合并到 main
git checkout main
git merge develop
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

## 🚫 忽略文件

`.gitignore` 文件已配置，以下文件不会上传：

```
node_modules/          # 依赖包
npm-debug.log         # npm 日志
yarn-error.log        # yarn 日志
.env                  # 环境变量
.DS_Store             # macOS 系统文件
data/knowledge.json   # 转换后的数据
data/knowledge.js     # 源数据文件
```

### 如果不小心提交了敏感文件

```bash
# 从 Git 历史中删除文件
git rm --cached data/knowledge.js
git commit -m "Remove sensitive file"
git push

# 如果已经推送，需要强制推送（谨慎使用）
git push -f
```

## 📚 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 文档](https://docs.github.com/)
- [GitHub CLI 文档](https://cli.github.com/manual/)
- [Git 教程 - 廖雪峰](https://www.liaoxuefeng.com/wiki/896043488029600)

## 🆘 常见问题

### 问题1：推送时要求输入用户名密码

**原因**：GitHub 已不支持密码认证

**解决方案**：
1. 使用 SSH 密钥（推荐）
2. 或使用 Personal Access Token

生成 Token：
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token
3. 选择权限（至少勾选 `repo`）
4. 复制 token（只显示一次）
5. 推送时使用 token 作为密码

### 问题2：推送失败 "rejected"

```bash
# 先拉取远程更新
git pull origin main --rebase

# 再推送
git push
```

### 问题3：文件太大无法推送

GitHub 单个文件限制 100MB

**解决方案**：
1. 确保大文件在 `.gitignore` 中
2. 如果已提交，从历史中删除：
```bash
git rm --cached large-file.zip
git commit -m "Remove large file"
```

### 问题4：忘记提交信息

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 如果已推送，需要强制推送
git push -f
```

## ✅ 检查清单

上传前确认：

- [ ] `.gitignore` 文件已配置
- [ ] 敏感信息已移除（密码、密钥等）
- [ ] README.md 已更新
- [ ] 代码已测试通过
- [ ] 依赖包已在 `package.json` 中声明
- [ ] 文档已完善

---

**准备好了吗？开始上传吧！** 🚀
