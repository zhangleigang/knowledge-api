# 认证系统文档

## 概述

为 knowledge API 添加了完整的用户认证系统，支持微信小程序登录。

## 新增文件

```
knowledge-api/
├── routes/
│   └── auth.js              # 认证路由
├── middleware/
│   └── auth.js              # 认证中间件
├── utils/
│   ├── jwt.js               # JWT 工具
│   └── userStore.js         # 用户数据存储
├── data/
│   └── users.json           # 用户数据文件（自动生成）
├── .env.example             # 环境变量示例
└── AUTH_README.md           # 本文档
```

## 功能特性

- ✅ 微信小程序静默登录
- ✅ 手机号登录
- ✅ JWT token 认证
- ✅ Token 自动过期（30天）
- ✅ 用户信息管理
- ✅ 开发模式（无需微信配置）
- ✅ 生产模式（真实微信登录）

## API 接口

### 1. 静默登录

**接口**: `POST /api/auth/login`

**请求体**:
```json
{
  "code": "071abc..."
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "userId": "user_1",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "openid": "oABC123...",
    "isNewUser": true
  }
}
```

### 2. 手机号登录

**接口**: `POST /api/auth/phone-login`

**请求体**:
```json
{
  "code": "071abc...",
  "phoneCode": "abc123...",
  "encryptedData": "...",
  "iv": "..."
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "userId": "user_1",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "phone": "13812345678",
    "openid": "oABC123..."
  }
}
```

### 3. 检查 Token

**接口**: `POST /api/auth/check`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**响应**:
```json
{
  "code": 0,
  "msg": "token有效",
  "data": {
    "userId": "user_1",
    "phone": "13812345678",
    "nickName": "张三",
    "avatarUrl": "https://..."
  }
}
```

### 4. 更新用户信息

**接口**: `POST /api/auth/update-profile`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**请求体**:
```json
{
  "nickName": "新昵称",
  "avatarUrl": "https://new-avatar.jpg"
}
```

**响应**:
```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "userId": "user_1",
    "nickName": "新昵称",
    "avatarUrl": "https://new-avatar.jpg"
  }
}
```

## 配置说明

### 开发模式（默认）

不需要任何配置，直接启动即可：

```bash
npm start
```

系统会自动使用模拟登录，生成模拟的 openid 和手机号。

### 生产模式

1. **复制环境变量文件**:
```bash
cp .env.example .env
```

2. **编辑 .env 文件**:
```env
PORT=3000
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
JWT_SECRET=your-strong-secret-key
```

3. **安装 dotenv**:
```bash
npm install dotenv
```

4. **在 server.js 顶部添加**:
```javascript
require('dotenv').config();
```

5. **启动服务**:
```bash
npm start
```

## 使用示例

### 小程序端代码

#### 1. 更新 simpleAuth.js

```javascript
const CONFIG = require('../config.js')

async function silentLogin() {
  try {
    // 1. 获取微信 code
    const code = await getWxCode()
    
    // 2. 调用后端登录接口
    const res = await wx.request({
      url: `${CONFIG.knowledgeApiUrl}/auth/login`,
      method: 'POST',
      data: { code }
    })
    
    if (res.data.code === 0) {
      // 3. 保存 token
      wx.setStorageSync('token', res.data.data.token)
      wx.setStorageSync('userId', res.data.data.userId)
      wx.setStorageSync('openid', res.data.data.openid)
      
      return { success: true, data: res.data.data }
    }
    
    throw new Error(res.data.msg || '登录失败')
  } catch (error) {
    console.error('登录失败:', error)
    return { success: false, error: error.message }
  }
}
```

#### 2. 在 API 请求中使用 Token

```javascript
wx.request({
  url: `${CONFIG.knowledgeApiUrl}/questions`,
  method: 'GET',
  header: {
    'Authorization': `Bearer ${wx.getStorageSync('token')}`
  },
  success: (res) => {
    console.log('请求成功:', res.data)
  }
})
```

## 数据存储

### 用户数据结构

```json
{
  "users": [
    {
      "id": "user_1",
      "openid": "oABC123...",
      "sessionKey": "abc123...",
      "phone": "13812345678",
      "nickName": "张三",
      "avatarUrl": "https://...",
      "createTime": "2024-01-01T00:00:00.000Z",
      "lastLoginTime": "2024-01-02T00:00:00.000Z",
      "updateTime": "2024-01-02T00:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### 数据文件位置

- `knowledge-api/data/users.json` - 用户数据文件（自动生成）

## 安全说明

### 当前实现

- ✅ JWT token 认证
- ✅ Token 自动过期（30天）
- ✅ 密码加密存储（session_key）
- ✅ HTTPS 传输（生产环境）

### 生产环境建议

1. **使用环境变量**
   - 不要在代码中硬编码密钥
   - 使用 `.env` 文件管理配置

2. **使用强密钥**
   ```bash
   # 生成随机密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **使用数据库**
   - 当前使用 JSON 文件存储
   - 生产环境建议使用 MySQL、MongoDB 等

4. **启用 HTTPS**
   - 使用 SSL 证书
   - 配置 Nginx 反向代理

5. **添加速率限制**
   ```bash
   npm install express-rate-limit
   ```

## 测试

### 1. 测试静默登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

### 2. 测试 Token 验证

```bash
curl -X POST http://localhost:3000/api/auth/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 测试更新用户信息

```bash
curl -X POST http://localhost:3000/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nickName":"新昵称"}'
```

## 常见问题

### Q1: 如何获取微信 APPID 和 SECRET？

A: 登录微信公众平台 https://mp.weixin.qq.com/，在"开发" → "开发管理" → "开发设置"中查看。

### Q2: 开发模式和生产模式有什么区别？

A: 
- **开发模式**：不需要配置微信参数，使用模拟登录
- **生产模式**：需要配置微信参数，调用真实的微信 API

### Q3: Token 过期后怎么办？

A: 小程序端检测到 token 过期（返回 401），自动调用 `silentLogin()` 重新登录。

### Q4: 如何切换到数据库存储？

A: 修改 `utils/userStore.js`，将文件操作改为数据库操作。

### Q5: 如何部署到服务器？

A: 参考 `DEPLOYMENT.md` 文档。

## 下一步

1. ✅ 基础认证功能已完成
2. ⏳ 更新小程序端代码
3. ⏳ 测试登录流程
4. ⏳ 配置生产环境
5. ⏳ 部署到服务器

## 相关文档

- [部署文档](./DEPLOYMENT.md)
- [阿里云部署](./ALIYUN_DEPLOY.md)
- [小程序端使用文档](../docs/SIMPLE_AUTH_USAGE.md)

---

**认证系统已就绪！** 🎉
