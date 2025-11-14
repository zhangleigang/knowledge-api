# 阿里云服务器快速部署指南

## 🎯 部署概览

将 Node.js API 部署到阿里云 ECS 服务器，配置域名和 HTTPS，让小程序可以访问。

## 📋 前置准备

### 1. 阿里云资源
- ✅ ECS 服务器（1核2G即可）
- ✅ 域名（已备案）
- ✅ 安全组开放端口：22, 80, 443

### 2. 本地准备
- ✅ SSH 客户端
- ✅ 服务器 IP 和登录密码

## 🚀 快速部署（5步完成）

### 第1步：连接服务器并安装环境

```bash
# 1. SSH 连接到服务器
ssh root@your-server-ip

# 2. 更新系统
yum update -y  # CentOS
# 或
apt update && apt upgrade -y  # Ubuntu

# 3. 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -  # CentOS
yum install -y nodejs  # CentOS
# 或
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -  # Ubuntu
apt install -y nodejs  # Ubuntu

# 4. 验证安装
node --version  # 应该显示 v18.x.x
npm --version

# 5. 安装 PM2（进程管理器）
npm install -g pm2

# 6. 安装 Nginx
yum install -y nginx  # CentOS
# 或
apt install -y nginx  # Ubuntu
```

### 第2步：上传代码到服务器

**方法A：使用 SCP 上传（推荐）**

```bash
# 在本地电脑执行（不是服务器）
cd /path/to/your/project

# 打包 knowledge-api 目录
tar -czf knowledge-api.tar.gz knowledge-api/

# 上传到服务器
scp knowledge-api.tar.gz root@your-server-ip:/root/

# 回到服务器，解压
ssh root@your-server-ip
cd /root
tar -xzf knowledge-api.tar.gz
cd knowledge-api
```

**方法B：使用 Git（如果代码在 GitHub）**

```bash
# 在服务器执行
cd /root
git clone https://github.com/your-username/your-repo.git
cd your-repo/knowledge-api
```

### 第3步：准备数据并启动服务

```bash
# 1. 安装依赖
npm install --production

# 2. 复制知识库数据文件
# 如果使用方法A上传，需要确保 utils/knowledge.js 在正确位置
# 如果文件在上级目录
cp ../utils/knowledge.js ./utils/

# 3. 转换数据
node convert-data.js

# 4. 测试启动
node server.js
# 看到 "知识库 API 服务已启动" 说明成功
# 按 Ctrl+C 停止

# 5. 使用 PM2 启动（后台运行）
pm2 start server.js --name knowledge-api

# 6. 设置开机自启
pm2 startup
pm2 save

# 7. 查看状态
pm2 status
pm2 logs knowledge-api
```

### 第4步：配置 Nginx 反向代理

```bash
# 1. 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/knowledge-api.conf << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;  # 改成你的域名

    # API 代理
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip 压缩
    gzip on;
    gzip_types application/json text/plain;
    gzip_min_length 1024;
}
EOF

# 2. 测试配置
nginx -t

# 3. 重启 Nginx
systemctl restart nginx
systemctl enable nginx

# 4. 检查状态
systemctl status nginx
```

### 第5步：配置域名和 HTTPS

```bash
# 1. 安装 Certbot（Let's Encrypt 免费证书）
# CentOS
yum install -y certbot python3-certbot-nginx

# Ubuntu
apt install -y certbot python3-certbot-nginx

# 2. 获取 SSL 证书（自动配置 Nginx）
certbot --nginx -d api.yourdomain.com

# 按提示输入邮箱，同意协议
# 选择 2（重定向 HTTP 到 HTTPS）

# 3. 测试自动续期
certbot renew --dry-run

# 4. 验证 HTTPS
curl https://api.yourdomain.com/health
```

## ✅ 验证部署

### 1. 测试 API

```bash
# 在服务器上测试
curl http://localhost:3000/health
curl http://localhost:3000/api/categories

# 测试域名
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/categories
```

### 2. 配置小程序

修改小程序 `config.js`:

```javascript
module.exports = {
  // ... 其他配置
  knowledgeApiUrl: 'https://api.yourdomain.com/api',
  useLocalKnowledge: false
}
```

### 3. 配置微信小程序服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 开发 -> 开发管理 -> 服务器域名
3. 添加 request 合法域名：`https://api.yourdomain.com`
4. 保存并等待生效（约5分钟）

## 🔧 常用管理命令

### PM2 进程管理

```bash
pm2 status                    # 查看状态
pm2 logs knowledge-api        # 查看日志
pm2 restart knowledge-api     # 重启服务
pm2 stop knowledge-api        # 停止服务
pm2 delete knowledge-api      # 删除服务
pm2 monit                     # 实时监控
```

### Nginx 管理

```bash
systemctl status nginx        # 查看状态
systemctl restart nginx       # 重启
systemctl reload nginx        # 重新加载配置
nginx -t                      # 测试配置
tail -f /var/log/nginx/error.log  # 查看错误日志
```

### 查看日志

```bash
# API 日志
pm2 logs knowledge-api --lines 100

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx -f
```

## 🔄 更新知识库数据

### 方法1：手动更新

```bash
# 1. 上传新的 knowledge.js
scp utils/knowledge.js root@your-server-ip:/root/knowledge-api/utils/

# 2. SSH 到服务器
ssh root@your-server-ip

# 3. 转换数据
cd /root/knowledge-api
node convert-data.js

# 4. 重启服务
pm2 restart knowledge-api
```

### 方法2：一键更新脚本

在服务器创建 `update.sh`:

```bash
cat > /root/knowledge-api/update.sh << 'EOF'
#!/bin/bash
cd /root/knowledge-api

echo "📦 备份旧数据..."
cp data/knowledge.js data/knowledge.backup.$(date +%Y%m%d_%H%M%S).js

echo "🔄 转换新数据..."
node convert-data.js

echo "🚀 重启服务..."
pm2 restart knowledge-api

echo "✅ 更新完成！"
pm2 logs knowledge-api --lines 20
EOF

chmod +x /root/knowledge-api/update.sh
```

使用：
```bash
# 上传新数据后执行
./update.sh
```

## 🔒 安全加固（可选）

### 1. 配置防火墙

```bash
# CentOS (firewalld)
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# Ubuntu (UFW)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. 修改 SSH 端口（可选）

```bash
# 编辑 SSH 配置
vi /etc/ssh/sshd_config

# 修改端口（例如改为 2222）
Port 2222

# 重启 SSH
systemctl restart sshd

# 记得在防火墙开放新端口
firewall-cmd --permanent --add-port=2222/tcp
firewall-cmd --reload
```

### 3. 限制 API 访问频率

在 Nginx 配置中添加：

```nginx
# 在 http 块中添加
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在 location 块中添加
limit_req zone=api_limit burst=20 nodelay;
```

## 🆘 常见问题

### 问题1：服务启动失败

```bash
# 查看详细日志
pm2 logs knowledge-api --lines 50

# 检查端口占用
lsof -i :3000
netstat -tlnp | grep 3000

# 手动启动查看错误
cd /root/knowledge-api
node server.js
```

### 问题2：Nginx 502 错误

```bash
# 检查 API 是否运行
pm2 status

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 检查 SELinux（CentOS）
getenforce
# 如果是 Enforcing，临时关闭测试
setenforce 0
```

### 问题3：HTTPS 证书获取失败

```bash
# 确保域名已解析到服务器 IP
ping api.yourdomain.com

# 确保 80 端口可访问
curl http://api.yourdomain.com

# 查看 Certbot 日志
tail -f /var/log/letsencrypt/letsencrypt.log

# 手动获取证书
certbot certonly --standalone -d api.yourdomain.com
```

### 问题4：小程序无法访问

1. 检查域名是否在微信公众平台配置
2. 确保使用 HTTPS（不是 HTTP）
3. 检查服务器防火墙和安全组
4. 测试 API 是否正常：`curl https://api.yourdomain.com/health`

## 📊 性能监控

### 安装监控面板

```bash
# 安装 PM2 监控模块
pm2 install pm2-server-monit

# 查看实时监控
pm2 monit
```

### 配置日志轮转

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 📞 需要帮助？

- 查看完整文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- API 文档：[README.md](./README.md)
- 阿里云帮助中心：https://help.aliyun.com/

---

**部署时间**: 约 15-30 分钟  
**难度**: ⭐⭐⭐☆☆  
**更新时间**: 2024-11-14
