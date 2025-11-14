#!/bin/bash

# 知识库 API - GitHub 上传脚本
# 使用方法: ./upload-to-github.sh your-username

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  知识库 API - GitHub 上传工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}❌ 错误: 请提供 GitHub 用户名${NC}"
    echo -e "${YELLOW}使用方法: ./upload-to-github.sh your-username${NC}"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="knowledge-api"

echo -e "${YELLOW}📋 配置信息:${NC}"
echo -e "   GitHub 用户名: ${GREEN}$GITHUB_USERNAME${NC}"
echo -e "   仓库名称: ${GREEN}$REPO_NAME${NC}"
echo ""

# 检查 Git 是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误: Git 未安装${NC}"
    echo -e "${YELLOW}请先安装 Git: https://git-scm.com/downloads${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git 已安装${NC}"

# 检查是否已经是 Git 仓库
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  检测到已存在 Git 仓库${NC}"
    read -p "是否要重新初始化? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .git
        echo -e "${GREEN}✅ 已删除旧的 Git 仓库${NC}"
    else
        echo -e "${YELLOW}⏭️  跳过初始化${NC}"
    fi
fi

# 初始化 Git 仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}🔧 初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
fi

# 检查 .gitignore
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}⚠️  .gitignore 文件不存在，创建中...${NC}"
    cat > .gitignore << 'EOF'
node_modules/
npm-debug.log
yarn-error.log
.env
.DS_Store
data/knowledge.json
data/knowledge.js
EOF
    echo -e "${GREEN}✅ .gitignore 文件已创建${NC}"
fi

# 检查敏感文件
echo -e "${YELLOW}🔍 检查敏感文件...${NC}"
if [ -f "data/knowledge.js" ]; then
    echo -e "${YELLOW}⚠️  发现 data/knowledge.js (已在 .gitignore 中)${NC}"
fi
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  发现 .env 文件 (已在 .gitignore 中)${NC}"
fi

# 添加文件
echo -e "${YELLOW}📦 添加文件到 Git...${NC}"
git add .

# 显示将要提交的文件
echo -e "${YELLOW}📋 将要提交的文件:${NC}"
git status --short

echo ""
read -p "确认提交这些文件? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
    echo -e "${RED}❌ 已取消${NC}"
    exit 1
fi

# 提交
echo -e "${YELLOW}💾 提交更改...${NC}"
git commit -m "Initial commit: 知识库 API 服务

- Express.js RESTful API
- 支持分类、分页、搜索
- 完整的部署文档
- Docker 支持
- 阿里云部署指南"

echo -e "${GREEN}✅ 提交完成${NC}"

# 设置主分支名称
echo -e "${YELLOW}🌿 设置主分支为 main...${NC}"
git branch -M main

# 添加远程仓库
REMOTE_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo -e "${YELLOW}🔗 添加远程仓库...${NC}"
echo -e "   URL: ${GREEN}$REMOTE_URL${NC}"

if git remote | grep -q "origin"; then
    git remote set-url origin $REMOTE_URL
    echo -e "${GREEN}✅ 远程仓库地址已更新${NC}"
else
    git remote add origin $REMOTE_URL
    echo -e "${GREEN}✅ 远程仓库已添加${NC}"
fi

# 提示创建 GitHub 仓库
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  ⚠️  重要提示${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${YELLOW}请先在 GitHub 创建仓库:${NC}"
echo -e "1. 访问: ${GREEN}https://github.com/new${NC}"
echo -e "2. Repository name: ${GREEN}$REPO_NAME${NC}"
echo -e "3. Description: ${GREEN}面试知识库 API 服务${NC}"
echo -e "4. 选择 Public 或 Private"
echo -e "5. ${RED}不要${NC}勾选 'Initialize this repository with a README'"
echo -e "6. 点击 'Create repository'"
echo ""
read -p "已创建 GitHub 仓库? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
    echo -e "${YELLOW}⏸️  已暂停，请创建仓库后重新运行${NC}"
    echo -e "${YELLOW}运行命令: git push -u origin main${NC}"
    exit 0
fi

# 推送到 GitHub
echo -e "${YELLOW}🚀 推送到 GitHub...${NC}"
echo -e "${YELLOW}如果是首次推送，可能需要输入 GitHub 用户名和密码${NC}"
echo ""

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ 上传成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}🎉 仓库地址:${NC}"
    echo -e "   ${GREEN}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
    echo ""
    echo -e "${YELLOW}📝 后续更新命令:${NC}"
    echo -e "   git add ."
    echo -e "   git commit -m \"更新说明\""
    echo -e "   git push"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ❌ 推送失败${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}可能的原因:${NC}"
    echo -e "1. GitHub 仓库未创建"
    echo -e "2. 认证失败（用户名或密码错误）"
    echo -e "3. 网络连接问题"
    echo ""
    echo -e "${YELLOW}解决方案:${NC}"
    echo -e "1. 确认已在 GitHub 创建仓库"
    echo -e "2. 使用 SSH 密钥或 Personal Access Token"
    echo -e "3. 手动推送: ${GREEN}git push -u origin main${NC}"
    echo ""
    echo -e "${YELLOW}详细帮助: 查看 GITHUB_UPLOAD.md${NC}"
    exit 1
fi
