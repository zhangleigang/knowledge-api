#!/bin/bash

# 生产环境部署脚本
# 使用方法: bash deploy-production.sh

echo "🚀 开始部署 Knowledge API 到生产环境..."

# 1. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 2. 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

echo "✅ PM2 已安装"

# 3. 安装依赖
echo "📦 安装项目依赖..."
npm install --production

# 4. 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，填入正确的配置"
    echo "   nano .env"
    read -p "按回车键继续..."
fi

# 5. 停止旧服务（如果存在）
if pm2 list | grep -q "knowledge-api"; then
    echo "🔄 停止旧服务..."
    pm2 stop knowledge-api
    pm2 delete knowledge-api
fi

# 6. 启动服务
echo "🚀 启动服务..."
pm2 start server.js --name knowledge-api

# 7. 保存 PM2 进程列表
echo "💾 保存 PM2 进程列表..."
pm2 save

# 8. 设置开机自启动
echo "🔧 设置开机自启动..."
pm2 startup

# 9. 显示服务状态
echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
pm2 status

echo ""
echo "📝 常用命令:"
echo "  查看日志: pm2 logs knowledge-api"
echo "  重启服务: pm2 restart knowledge-api"
echo "  停止服务: pm2 stop knowledge-api"
echo "  查看状态: pm2 status"
echo ""
echo "🌐 API 地址: http://localhost:3000"
echo "📖 文档: http://localhost:3000/api"
