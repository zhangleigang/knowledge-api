# 知识库 API 服务

面试知识库的后端 API 服务，为微信小程序提供知识库数据接口。

## ✨ 特性

- 🚀 基于 Express.js 的 RESTful API
- 📦 支持分类、分页、搜索功能
- 🔄 自动数据转换和缓存
- 📊 完整的 API 文档
- ☁️ 已部署到生产环境

## 📋 技术栈

- Node.js 18+
- Express.js 4.x
- PM2 进程管理
- Nginx 反向代理

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/zhangleigang/knowledge-api.git
cd knowledge-api

# 2. 安装依赖
npm install

# 3. 转换数据
node convert-data.js

# 4. 启动服务
npm start
```

服务将在 `http://localhost:3000` 启动。

### 生产部署

详见 [部署文档](./DEPLOYMENT.md)

## 📚 API 文档

### 基础信息

- **生产地址**: `http://47.95.196.190:8080/api`
- **响应格式**: JSON
- **字符编码**: UTF-8

### 端点列表

#### 1. 健康检查

```
GET /health
```

#### 2. 获取分类列表

```
GET /api/categories
```

#### 3. 获取题目列表

```
GET /api/questions?category=hdfs&page=1&pageSize=20
```

参数：
- `category` (可选): 分类 key
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 20
- `keyword` (可选): 搜索关键词

#### 4. 获取单个题目

```
GET /api/questions/:id
```

## 📁 项目结构

```
knowledge-api/
├── server.js              # 主服务文件
├── convert-data.js        # 数据转换脚本
├── package.json           # 项目配置
├── data/                  # 数据目录
│   └── knowledge.json     # 转换后的数据
├── utils/                 # 工具目录
│   └── knowledge.js       # 原始知识库数据
└── docs/                  # 文档目录
    └── DEPLOYMENT.md      # 部署文档
```

## 🔧 配置

### 环境变量

```bash
PORT=3000              # 端口号
NODE_ENV=production    # 运行环境
```

## 📊 性能

- 支持并发请求
- 内存缓存数据
- 响应时间 < 50ms
- 支持 Gzip 压缩

## 🔄 更新数据

```bash
# 1. 更新 utils/knowledge.js 文件
# 2. 转换数据
node convert-data.js

# 3. 重启服务
pm2 restart knowledge-api
```

## 📝 相关文档

- [部署文档](./DEPLOYMENT.md) - 完整的部署指南
- [GitHub 仓库](https://github.com/zhangleigang/knowledge-api)

## 📞 联系方式

- GitHub: [@zhangleigang](https://github.com/zhangleigang)

---

**当前版本**: 1.0.0  
**最后更新**: 2024-11-14
