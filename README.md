# 大数据面试知识库 API 服务

一个轻量级的 Node.js API 服务，为微信小程序提供知识库数据接口。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd knowledge-api
npm install
```

### 2. 转换数据

从小程序的 `utils/knowledge.js` 转换数据：

```bash
node convert-data.js
```

这会在 `data/` 目录下生成：
- `knowledge.json` - JSON 格式数据
- `knowledge.js` - Node.js 模块

### 3. 启动服务

**开发模式**（自动重启）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

服务默认运行在 `http://localhost:3000`

## 📡 API 端点

### 健康检查
```
GET /health
```

**响应示例**：
```json
{
  "status": "ok",
  "timestamp": "2024-11-13T12:00:00.000Z"
}
```

### 获取所有分类
```
GET /api/categories
```

**响应示例**：
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

### 获取题目列表
```
GET /api/questions?category=hdfs&page=1&pageSize=20&keyword=架构
```

**查询参数**：
- `category` (可选) - 分类 key
- `page` (可选) - 页码，默认 1
- `pageSize` (可选) - 每页数量，默认 20
- `keyword` (可选) - 搜索关键词

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 获取题目详情
```
GET /api/questions/:id
```

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "category": "hdfs",
    "question": "HDFS的架构是什么？",
    "answer": "HDFS采用主从架构..."
  }
}
```

### 获取完整知识库
```
GET /api/knowledge/full
```

用于小程序首次加载时缓存所有数据。

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "categories": [...],
    "questions": [...],
    "version": "1.0.0",
    "updateTime": "2024-11-13T12:00:00.000Z"
  }
}
```

### 获取数据版本
```
GET /api/knowledge/version
```

用于检查数据是否有更新。

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "updateTime": "2024-11-13T12:00:00.000Z",
    "totalQuestions": 100,
    "totalCategories": 9
  }
}
```

## 🔧 配置

### 端口配置

通过环境变量设置端口：

```bash
PORT=8080 npm start
```

或创建 `.env` 文件：

```env
PORT=8080
```

### CORS 配置

默认允许所有域名跨域访问。如需限制，修改 `server.js`：

```javascript
app.use(cors({
  origin: 'https://your-domain.com'
}));
```

## 📦 部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name knowledge-api

# 查看状态
pm2 status

# 查看日志
pm2 logs knowledge-api

# 重启服务
pm2 restart knowledge-api

# 停止服务
pm2 stop knowledge-api
```

### 使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t knowledge-api .
docker run -p 3000:3000 knowledge-api
```

### 部署到云服务

推荐部署平台：
- **Vercel** - 免费，自动 HTTPS
- **Railway** - 简单易用
- **阿里云/腾讯云** - 国内访问快
- **Heroku** - 老牌 PaaS

## 🔄 更新数据

当小程序的知识库数据更新后：

1. 重新运行转换脚本：
   ```bash
   node convert-data.js
   ```

2. 重启服务：
   ```bash
   npm start
   # 或使用 PM2
   pm2 restart knowledge-api
   ```

## 📊 性能优化

### 已启用的优化

- ✅ **Gzip 压缩** - 减少传输体积
- ✅ **CORS 支持** - 允许跨域访问
- ✅ **分页查询** - 避免一次返回大量数据

### 建议的优化

1. **添加缓存**
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 600 }); // 10分钟缓存
   ```

2. **添加限流**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15分钟
     max: 100 // 最多100个请求
   });
   app.use(limiter);
   ```

3. **使用 CDN**
   - 将 API 部署到 CDN 边缘节点
   - 加速全球访问

## 🐛 故障排查

### 服务无法启动

检查端口是否被占用：
```bash
lsof -i :3000
```

### 数据转换失败

确保 `../utils/knowledge.js` 文件存在且格式正确。

### CORS 错误

检查小程序请求域名是否在微信公众平台白名单中。

## 📝 开发建议

### 添加新的 API 端点

在 `server.js` 中添加：

```javascript
app.get('/api/your-endpoint', (req, res) => {
  try {
    // 你的逻辑
    res.json({
      code: 0,
      message: 'success',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: error.message
    });
  }
});
```

### 统一响应格式

所有 API 响应遵循统一格式：

```json
{
  "code": 0,        // 0 表示成功，-1 表示失败
  "message": "",    // 提示信息
  "data": {}        // 返回数据
}
```

## 📄 License

MIT

---

**创建时间**: 2024-11-13  
**维护者**: Your Name  
**版本**: 1.0.0
