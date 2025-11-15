# 快速开始 - Knowledge API 认证系统

## 🚀 30秒启动

```bash
# 1. 进入目录
cd knowledge-api

# 2. 启动服务
npm start

# 3. 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'
```

## 📋 API 速查

### 登录
```bash
POST /api/auth/login
Body: {"code": "wx_code"}
```

### 验证
```bash
POST /api/auth/check
Header: Authorization: Bearer {token}
```

### 更新
```bash
POST /api/auth/update-profile
Header: Authorization: Bearer {token}
Body: {"nickName": "昵称"}
```

## 🔧 配置

### 开发模式（默认）
无需配置，直接使用

### 生产模式
```bash
cp .env.example .env
# 编辑 .env 填入微信参数
npm start
```

## 📖 完整文档

- [认证系统完整文档](../docs/AUTH_SYSTEM_COMPLETE.md)
- [后端搭建指南](../docs/BACKEND_AUTH_SETUP.md)
- [API 详细文档](./AUTH_README.md)

---

**就这么简单！** 🎉
