# 🚀 快速开始指南

5分钟内启动知识库 API 服务！

## 步骤 1：安装依赖

```bash
cd knowledge-api
npm install
```

## 步骤 2：转换数据

```bash
node convert-data.js
```

你会看到：
```
✅ 数据转换完成！
📁 输出目录: /path/to/knowledge-api/data
📊 题目总数: XXX
📁 分类总数: 9
```

## 步骤 3：启动服务

```bash
npm start
```

你会看到：
```
🚀 知识库 API 服务已启动
📍 地址: http://localhost:3000
📊 题目总数: XXX
📁 分类总数: 9
```

## 步骤 4：测试 API

打开浏览器访问：

```
http://localhost:3000/health
```

或使用 curl：

```bash
# 健康检查
curl http://localhost:3000/health

# 获取分类
curl http://localhost:3000/api/categories

# 获取题目列表
curl http://localhost:3000/api/questions?category=hdfs&page=1&pageSize=10
```

## 步骤 5：配置小程序

### 5.1 修改 API 地址

在小程序的 `config.js` 中添加：

```javascript
module.exports = {
  // ... 其他配置
  knowledgeApiUrl: 'http://localhost:3000/api' // 开发环境
  // knowledgeApiUrl: 'https://api.yourdomain.com/api' // 生产环境
};
```

### 5.2 修改知识库页面

在 `pages/knowledge/index.js` 中：

```javascript
const knowledgeApi = require('../../utils/knowledge-api');
const app = getApp();

Page({
  data: {
    categories: [],
    questions: [],
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  async loadData() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 获取分类
      const categories = await knowledgeApi.getCategories();
      
      // 获取题目列表
      const result = await knowledgeApi.getQuestions({
        page: 1,
        pageSize: 20
      });
      
      this.setData({
        categories,
        questions: result.list,
        loading: false
      });
      
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      console.error(error);
    }
  }
});
```

## 🎉 完成！

现在你的知识库 API 服务已经运行了！

## 下一步

### 开发环境

使用 nodemon 自动重启：

```bash
npm run dev
```

### 生产环境

使用 PM2 部署：

```bash
npm install -g pm2
pm2 start server.js --name knowledge-api
pm2 save
```

### 部署到服务器

查看 [部署指南](./DEPLOYMENT.md)

## 常见问题

### Q: 数据转换失败？

**A**: 确保 `../utils/knowledge.js` 文件存在且格式正确。

### Q: 端口被占用？

**A**: 修改端口：
```bash
PORT=8080 npm start
```

### Q: 小程序请求失败？

**A**: 检查：
1. API 服务是否启动
2. 小程序中的 API 地址是否正确
3. 微信开发者工具是否开启了"不校验合法域名"

### Q: 如何更新知识库数据？

**A**: 
1. 修改 `utils/knowledge.js`
2. 重新运行 `node convert-data.js`
3. 重启服务 `pm2 restart knowledge-api`

## 📚 更多文档

- [完整 README](./README.md)
- [API 文档](./README.md#-api-端点)
- [部署指南](./DEPLOYMENT.md)

---

**祝你使用愉快！** 🎊
