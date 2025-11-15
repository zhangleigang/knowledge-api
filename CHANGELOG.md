# 更新日志

## [1.1.0] - 2024-11-15

### 新增功能 🎉

#### 用户认证系统
- ✅ 完整的用户认证系统
- ✅ 微信小程序静默登录
- ✅ 手机号登录支持
- ✅ JWT token 认证
- ✅ Token 自动过期（30天）
- ✅ 用户信息管理

#### API 接口
- `POST /api/auth/login` - 静默登录
- `POST /api/auth/phone-login` - 手机号登录
- `POST /api/auth/check` - 检查token有效性
- `POST /api/auth/update-profile` - 更新用户信息

#### 工作模式
- **开发模式**：无需微信配置，使用模拟登录
- **生产模式**：真实微信登录，需配置 APPID 和 SECRET

### 新增文件

```
routes/
  └── auth.js              # 认证路由
middleware/
  └── auth.js              # 认证中间件
utils/
  ├── jwt.js               # JWT 工具
  └── userStore.js         # 用户存储
.env.example               # 环境变量示例
AUTH_README.md             # 认证文档
QUICK_START.md             # 快速开始
```

### 更新文件

- `server.js` - 集成认证系统
- `README.md` - 更新文档

### 技术栈

- Express.js - Web 框架
- JWT - Token 认证
- Crypto - 数据加密
- Axios - HTTP 客户端

### 安全特性

- ✅ JWT token 签名验证
- ✅ Token 自动过期
- ✅ 密钥加密存储
- ✅ HTTPS 支持（生产环境）

### 文档

- [认证系统文档](./AUTH_README.md)
- [快速开始指南](./QUICK_START.md)
- [部署文档](./DEPLOYMENT.md)

---

## [1.0.0] - 2024-11-14

### 初始版本

- ✅ 知识库 API 服务
- ✅ 分类管理
- ✅ 题目管理
- ✅ 分页查询
- ✅ 关键词搜索
- ✅ 完整数据导出
- ✅ 版本管理

---

**提交记录**: https://github.com/zhangleigang/knowledge-api
