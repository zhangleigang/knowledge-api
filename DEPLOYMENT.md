# 知识库 API 部署指南

## 📋 部署前准备

### 1. 准备服务器

推荐配置：
- **CPU**: 1核
- **内存**: 512MB
- **带宽**: 1Mbps
- **系统**: Ubuntu 20.04 / CentOS 7+

### 2. 安装 Node.js

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 或使用包管理器
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3. 安装 PM2（进程管理器）

```bash
npm install -g pm2
```

## 🚀 部署步骤

### 方案 A：手动部署

#### 1. 上传代码

```bash
# 在本地打包
cd knowledge-api
tar -czf knowledge-api.tar.gz *

# 上传到服务器
scp knowledge-api.tar.gz user@your-server:/home/user/

# 在服务器上解压
ssh user@your-server
cd /home/user
mkdir knowledge-api
tar -xzf knowledge-api.tar.gz -C knowledge-api
cd knowledge-api
```

#### 2. 安装依赖

```bash
npm install --production
```

#### 3. 转换数据

```bash
# 确保 ../utils/knowledge.js 存在
node convert-data.js
```

#### 4. 启动服务

```bash
# 使用 PM2 启动
pm2 start server.js --name knowledge-api

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs knowledge-api
```

### 方案 B：使用 Git 部署

#### 1. 在服务器上克隆代码

```bash
cd /home/user
git clone https://your-repo.git
cd knowledge-api
```

#### 2. 安装和启动

```bash
npm install --production
node convert-data.js
pm2 start server.js --name knowledge-api
pm2 save
```

#### 3. 设置自动部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash
cd /home/user/knowledge-api
git pull
npm install --production
node convert-data.js
pm2 restart knowledge-api
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方案 C：使用 Docker 部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY package*.json ./
RUN npm install --production

# 复制代码
COPY . .

# 复制知识库数据
COPY ../utils/knowledge.js ./utils/

# 转换数据
RUN node convert-data.js

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. 构建和运行

```bash
# 构建镜像
docker build -t knowledge-api .

# 运行容器
docker run -d \
  --name knowledge-api \
  -p 3000:3000 \
  --restart unless-stopped \
  knowledge-api

# 查看日志
docker logs -f knowledge-api
```

#### 3. 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
```

运行：
```bash
docker-compose up -d
```

## 🌐 配置域名和 HTTPS

### 1. 配置 Nginx 反向代理

安装 Nginx:
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS
sudo yum install nginx
```

创建配置文件 `/etc/nginx/sites-available/knowledge-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/knowledge-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 📊 性能优化

### 1. 启用 Gzip 压缩（Nginx）

在 Nginx 配置中添加:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. 配置缓存

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    
    # 缓存配置
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 3. 限流配置

```nginx
# 在 http 块中
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在 location 块中
limit_req zone=api_limit burst=20 nodelay;
```

## 🔒 安全配置

### 1. 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. 添加 API 密钥验证（可选）

修改 `server.js`:

```javascript
const API_KEY = process.env.API_KEY || 'your-secret-key';

// 添加中间件
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({
      code: -1,
      message: '未授权访问'
    });
  }
  next();
});
```

### 3. 限制 CORS 来源

```javascript
app.use(cors({
  origin: ['https://your-miniprogram-domain.com'],
  credentials: true
}));
```

## 📱 小程序配置

### 1. 配置服务器域名

在微信公众平台 -> 开发 -> 开发管理 -> 服务器域名中添加：

```
request合法域名: https://api.yourdomain.com
```

### 2. 修改小程序 API 地址

在 `utils/knowledge-api.js` 中修改:

```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

或在 `config.js` 中配置:

```javascript
module.exports = {
  // ... 其他配置
  knowledgeApiUrl: 'https://api.yourdomain.com/api'
};
```

## 🔄 更新知识库数据

### 方法 1：手动更新

```bash
# 1. 更新 knowledge.js 文件
scp utils/knowledge.js user@server:/home/user/knowledge-api/utils/

# 2. SSH 到服务器
ssh user@server

# 3. 转换数据
cd /home/user/knowledge-api
node convert-data.js

# 4. 重启服务
pm2 restart knowledge-api
```

### 方法 2：自动化脚本

创建 `update-knowledge.sh`:

```bash
#!/bin/bash

# 备份旧数据
cp data/knowledge.js data/knowledge.backup.js

# 转换新数据
node convert-data.js

# 重启服务
pm2 restart knowledge-api

echo "知识库更新完成！"
```

### 方法 3：CI/CD 自动部署

使用 GitHub Actions:

```yaml
name: Deploy Knowledge API

on:
  push:
    branches: [ main ]
    paths:
      - 'utils/knowledge.js'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/user/knowledge-api
            git pull
            node convert-data.js
            pm2 restart knowledge-api
```

## 📈 监控和日志

### 1. PM2 监控

```bash
# 查看实时日志
pm2 logs knowledge-api

# 查看监控面板
pm2 monit

# 查看详细信息
pm2 show knowledge-api
```

### 2. 配置日志轮转

创建 `pm2-logrotate` 配置:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. 添加健康检查

使用 cron 定时检查:

```bash
# 编辑 crontab
crontab -e

# 添加每5分钟检查一次
*/5 * * * * curl -f http://localhost:3000/health || pm2 restart knowledge-api
```

## 🆘 故障排查

### 服务无法启动

```bash
# 查看日志
pm2 logs knowledge-api --lines 100

# 检查端口占用
lsof -i :3000

# 检查 Node.js 版本
node --version
```

### 内存不足

```bash
# 查看内存使用
pm2 monit

# 限制内存使用
pm2 start server.js --name knowledge-api --max-memory-restart 200M
```

### 请求超时

检查 Nginx 配置:

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

## 📞 技术支持

如有问题，请查看：
- [项目 README](./README.md)
- [API 文档](./README.md#-api-端点)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**更新时间**: 2024-11-13  
**版本**: 1.0.0
