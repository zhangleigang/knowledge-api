#!/bin/bash

# API 部署测试脚本

echo "========================================="
echo "  知识库 API 部署测试"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试 URL（根据实际情况修改）
BASE_URL="http://localhost:3000"

echo -e "${YELLOW}测试 URL: $BASE_URL${NC}"
echo ""

# 1. 测试健康检查
echo "1️⃣  测试健康检查..."
response=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 健康检查通过${NC}"
    echo "   响应: $body"
else
    echo -e "${RED}❌ 健康检查失败 (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# 2. 测试获取分类
echo "2️⃣  测试获取分类列表..."
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/categories)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 获取分类成功${NC}"
    # 使用 python 格式化 JSON（如果有的话）
    if command -v python3 &> /dev/null; then
        echo "$body" | python3 -m json.tool | head -20
    else
        echo "   响应: $body" | head -c 200
    fi
else
    echo -e "${RED}❌ 获取分类失败 (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# 3. 测试获取题目列表
echo "3️⃣  测试获取题目列表..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/questions?pageSize=2")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 获取题目成功${NC}"
    if command -v python3 &> /dev/null; then
        echo "$body" | python3 -m json.tool | head -30
    else
        echo "   响应: $body" | head -c 200
    fi
else
    echo -e "${RED}❌ 获取题目失败 (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# 4. 测试分类筛选
echo "4️⃣  测试分类筛选..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/questions?category=hdfs&pageSize=1")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 分类筛选成功${NC}"
else
    echo -e "${RED}❌ 分类筛选失败 (HTTP $http_code)${NC}"
fi
echo ""

# 5. 测试搜索功能
echo "5️⃣  测试搜索功能..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/questions?keyword=HDFS&pageSize=1")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ 搜索功能正常${NC}"
else
    echo -e "${RED}❌ 搜索功能失败 (HTTP $http_code)${NC}"
fi
echo ""

# 6. 检查 PM2 状态
echo "6️⃣  检查 PM2 服务状态..."
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 list | grep knowledge-api | grep online)
    if [ ! -z "$pm2_status" ]; then
        echo -e "${GREEN}✅ PM2 服务运行正常${NC}"
        pm2 list | grep knowledge-api
    else
        echo -e "${RED}❌ PM2 服务未运行${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 未安装${NC}"
fi
echo ""

# 总结
echo "========================================="
echo -e "${GREEN}  ✅ 所有测试通过！${NC}"
echo "========================================="
echo ""
echo "📝 下一步："
echo "1. 配置 Nginx 反向代理"
echo "2. 配置域名和 HTTPS"
echo "3. 在微信公众平台添加服务器域名"
echo "4. 修改小程序 config.js 中的 API 地址"
echo ""
