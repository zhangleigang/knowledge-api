/**
 * JWT 工具
 * 用于生成和验证 JWT token
 */

const crypto = require('crypto');

// JWT 密钥（生产环境应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = 30 * 24 * 60 * 60; // 30天（秒）

/**
 * Base64 URL 编码
 */
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Base64 URL 解码
 */
function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString();
}

/**
 * 生成 JWT token
 * @param {Object} payload - 载荷数据
 * @param {number} expiresIn - 过期时间（秒），默认30天
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
    // Header
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    // Payload
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now, // 签发时间
        exp: now + expiresIn // 过期时间
    };

    // 编码 header 和 payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

    // 生成签名
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    // 组合 token
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解码后的载荷，验证失败返回 null
 */
function verifyToken(token) {
    try {
        if (!token) {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const [encodedHeader, encodedPayload, signature] = parts;

        // 验证签名
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        if (signature !== expectedSignature) {
            console.log('❌ JWT 签名验证失败');
            return null;
        }

        // 解码 payload
        const payload = JSON.parse(base64UrlDecode(encodedPayload));

        // 检查过期时间
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            console.log('❌ JWT 已过期');
            return null;
        }

        return payload;
    } catch (error) {
        console.error('JWT 验证错误:', error);
        return null;
    }
}

/**
 * 从请求头中提取 token
 * @param {Object} req - Express 请求对象
 * @returns {string|null} token
 */
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

module.exports = {
    generateToken,
    verifyToken,
    extractToken
};
