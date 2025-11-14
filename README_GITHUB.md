# 知识库 API 服务

面试知识库的后端 API 服务，为微信小程序提供知识库数据接口。

## ✨ 特性

- 🚀 基于 Express.js 的 RESTful API
- 📦 支持分类、分页、搜索功能
- 🔄 自动数据转换和缓存
- 📊 完整的 API 文档
- 🐳 支持 Docker 部署
- ☁️ 阿里云快速部署指南

## 📋 技术栈

- Node.js 18+
- Express.js 4.x
- CORS 支持
- 内存缓存

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/knowledge-api.git
cd knowledge-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 准备数据

将你的知识库数据文件 `knowledge.js` 放到 `utils/` 目录：

```bash
# 数据文件格式示例
module.exports = {
  categories: [
    { key: 'hdfs', name: 'HDFS', icon: '📁' }
  ],
  topics: [
    {
      id: 'hdfs-topic-1',
      title: 'HDFS 基础',
      categoryKey: 'hdfs',
      faqs: ['什么是 HDFS？'],
      answers: ['HDFS 是...']
    }
  ]
};
```

### 4. 转换数据

```bash
node convert-data.js
```

### 5. 启动服务

```bash
# 开发模式
npm start

# 或直接运行
node server.js
```

服务将在 `http://localhost:3000` 启动。

### 6. 测试 API

```bash
# 健康检查
curl http://localhost:3000/health

# 获取分类列表
curl http://localhost:3000/api/categories

# 获取题目列表
curl http://localhost:3000/api/questions?category=hdfs&page=1&pageSize=10
```

## 📚 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **响应格式**: JSON
- **字符编码**: UTF-8

### 端点列表

#### 1. 健康检查

```
GET /health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-11-14T12:00:00.000Z"
}
```

#### 2. 获取分类列表

```
GET /api/categories
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "key": "hdfs",
      "name": "HDFS",
      "icon": "📁"
    }
  ]
}
```

#### 3. 获取题目列表

```
GET /api/questions
```

参数：
- `category` (可选): 分类 key
- `page` (可选): 页码，默认 1
- `pageSize` (可选): 每页数量，默认 20
- `keyword` (可选): 搜索关键词

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "hdfs-topic-1-0",
        "title": "HDFS 基础",
        "categoryKey": "hdfs",
        "question": "什么是 HDFS？",
        "answer": "HDFS 是...",
        "faqs": ["什么是 HDFS？"],
        "answers": ["HDFS 是..."]
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

#### 4. 获取单个题目

```
GET /api/questions/:id
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "hdfs-topic-1-0",
    "title": "HDFS 基础",
    "categoryKey": "hdfs",
    "question": "什么是 HDFS？",
    "answer": "HDFS 是...",
    "faqs": ["什么是 HDFS？"],
    "answers": ["HDFS 是..."]
  }
}
```

## 🚢 部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name knowledge-api

# 设置开机自启
pm2 startup
pm2 save
```

### 使用 Docker 部署

```bash
# 构建镜像
docker build -t knowledge-api .

# 运行容器
docker run -d -p 3000:3000 --name knowledge-api knowledge-api
```

### 阿里云部署

详细步骤请查看 [阿里云部署指南](./ALIYUN_DEPLOY.md)

### 完整部署文档

查看 [完整部署文档](./DEPLOYMENT.md) 了解更多部署选项。

## 📁 项目结构

```
knowledge-api/
├── server.js              # 主服务文件
├── convert-data.js        # 数据转换脚本
├── package.json           # 项目配置
├── data/                  # 数据目录（不提交到 Git）
│   ├── knowledge.js       # 源数据文件
│   └── knowledge.json     # 转换后的数据
├── utils/                 # 工具目录
│   └── knowledge.js       # 原始知识库数据（需要自己提供）
├── DEPLOYMENT.md          # 完整部署文档
├── ALIYUN_DEPLOY.md       # 阿里云部署指南
└── README.md              # 项目说明
```

## 🔧 配置

### 环境变量

可以通过环境变量配置服务：

```bash
# 端口号（默认 3000）
PORT=3000

# Node 环境（默认 development）
NODE_ENV=production
```

### 修改端口

```bash
# 方法1：环境变量
PORT=8080 node server.js

# 方法2：修改 server.js
const PORT = process.env.PORT || 8080;
```

## 🔄 更新数据

当知识库数据更新时：

```bash
# 1. 更新 utils/knowledge.js 文件
# 2. 重新转换数据
node convert-data.js

# 3. 重启服务
pm2 restart knowledge-api
```

## 🛠️ 开发

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 或使用 nodemon 自动重启
npm install -g nodemon
nodemon server.js
```

### 测试

```bash
# 运行测试脚本
node test-api.js
```

## 📊 性能

- 支持并发请求
- 内存缓存数据
- 响应时间 < 50ms
- 支持 Gzip 压缩

## 🔒 安全

- CORS 配置
- 请求频率限制（可选）
- HTTPS 支持
- API 密钥验证（可选）

## 🐛 故障排查

### 服务无法启动

```bash
# 检查端口占用
lsof -i :3000

# 查看日志
pm2 logs knowledge-api
```

### 数据加载失败

```bash
# 检查数据文件
ls -lh data/knowledge.json

# 重新转换数据
node convert-data.js
```

## 📝 更新日志

### v1.0.0 (2024-11-14)

- ✨ 初始版本发布
- 🚀 支持分类、分页、搜索
- 📦 完整的 API 文档
- 🐳 Docker 支持
- ☁️ 阿里云部署指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- GitHub: [@your-username](https://github.com/your-username)
- Email: your-email@example.com

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
