/**
 * 认证中间件
 * 用于保护需要登录才能访问的路由
 */

const { verifyToken, extractToken } = require('../utils/jwt');
const { getUser } = require('../utils/userStore');

/**
 * 认证中间件
 * 验证请求中的 JWT token
 */
function authMiddleware(req, res, next) {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                code: -1,
                msg: '未提供认证token'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                code: -1,
                msg: 'token无效或已过期'
            });
        }

        // 验证用户是否存在
        const user = getUser(decoded.userId);

        if (!user) {
            return res.status(401).json({
                code: -1,
                msg: '用户不存在'
            });
        }

        // 将用户信息附加到请求对象
        req.user = {
            userId: user.id,
            openid: user.openid,
            phone: user.phone,
            nickName: user.nickName,
            avatarUrl: user.avatarUrl
        };

        next();
    } catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({
            code: -1,
            msg: '认证失败'
        });
    }
}

/**
 * 可选认证中间件
 * 如果有 token 则验证，没有 token 也允许通过
 */
function optionalAuthMiddleware(req, res, next) {
    try {
        const token = extractToken(req);

        if (!token) {
            // 没有 token，继续执行
            req.user = null;
            return next();
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            // token 无效，继续执行
            req.user = null;
            return next();
        }

        // 验证用户是否存在
        const user = getUser(decoded.userId);

        if (user) {
            req.user = {
                userId: user.id,
                openid: user.openid,
                phone: user.phone,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('可选认证中间件错误:', error);
        req.user = null;
        next();
    }
}

module.exports = {
    authMiddleware,
    optionalAuthMiddleware
};
