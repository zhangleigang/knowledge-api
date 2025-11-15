/**
 * 认证路由
 * 处理用户登录、注册、token验证等
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { generateToken, verifyToken } = require('../utils/jwt');
const { getUser, createUser, updateUser, getUserByOpenid } = require('../utils/userStore');

// 微信小程序配置（从环境变量读取）
const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_SECRET || '';

/**
 * 静默登录
 * POST /api/auth/login
 * Body: { code: '微信登录code' }
 */
router.post('/login', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.json({
                code: -1,
                msg: '缺少登录code'
            });
        }

        // 开发模式：如果没有配置微信参数，使用模拟登录
        if (!WECHAT_APPID || !WECHAT_SECRET) {
            console.log('⚠️  开发模式：使用模拟登录');
            const mockOpenid = 'mock_openid_' + Date.now();
            let user = await getUserByOpenid(mockOpenid);

            if (!user) {
                user = await createUser({
                    openid: mockOpenid,
                    sessionKey: 'mock_session_key',
                    createTime: new Date().toISOString()
                });
            }

            const token = generateToken({
                userId: user.id,
                openid: user.openid
            });

            return res.json({
                code: 0,
                msg: '登录成功（开发模式）',
                data: {
                    userId: user.id,
                    token,
                    openid: user.openid,
                    isNewUser: !user.lastLoginTime
                }
            });
        }

        // 生产模式：调用微信接口
        const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: WECHAT_APPID,
                secret: WECHAT_SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        if (wxRes.data.errcode) {
            return res.json({
                code: -1,
                msg: wxRes.data.errmsg || '微信登录失败'
            });
        }

        const { openid, session_key } = wxRes.data;

        // 查询或创建用户
        let user = await getUserByOpenid(openid);
        const isNewUser = !user;

        if (!user) {
            user = await createUser({
                openid,
                sessionKey: session_key,
                createTime: new Date().toISOString()
            });
        } else {
            // 更新 session_key 和最后登录时间
            user = await updateUser(user.id, {
                sessionKey: session_key,
                lastLoginTime: new Date().toISOString()
            });
        }

        // 生成 JWT token
        const token = generateToken({
            userId: user.id,
            openid: user.openid
        });

        res.json({
            code: 0,
            msg: '登录成功',
            data: {
                userId: user.id,
                token,
                openid: user.openid,
                isNewUser
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.json({
            code: -1,
            msg: error.message || '登录失败'
        });
    }
});

/**
 * 手机号登录
 * POST /api/auth/phone-login
 * Body: { code, phoneCode, encryptedData, iv }
 */
router.post('/phone-login', async (req, res) => {
    try {
        const { code, phoneCode, encryptedData, iv } = req.body;

        if (!code) {
            return res.json({
                code: -1,
                msg: '缺少登录code'
            });
        }

        // 开发模式：模拟手机号登录
        if (!WECHAT_APPID || !WECHAT_SECRET) {
            console.log('⚠️  开发模式：使用模拟手机号登录');
            const mockOpenid = 'mock_openid_' + Date.now();
            const mockPhone = '138****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            let user = await getUserByOpenid(mockOpenid);

            if (!user) {
                user = await createUser({
                    openid: mockOpenid,
                    sessionKey: 'mock_session_key',
                    phone: mockPhone,
                    createTime: new Date().toISOString()
                });
            } else {
                user = await updateUser(user.id, {
                    phone: mockPhone,
                    lastLoginTime: new Date().toISOString()
                });
            }

            const token = generateToken({
                userId: user.id,
                openid: user.openid,
                phone: mockPhone
            });

            return res.json({
                code: 0,
                msg: '登录成功（开发模式）',
                data: {
                    userId: user.id,
                    token,
                    phone: mockPhone,
                    openid: user.openid
                }
            });
        }

        // 生产模式：获取 session_key
        const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: WECHAT_APPID,
                secret: WECHAT_SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        if (wxRes.data.errcode) {
            return res.json({
                code: -1,
                msg: wxRes.data.errmsg || '获取session_key失败'
            });
        }

        const { openid, session_key } = wxRes.data;

        // 解密手机号
        const phoneData = decryptData(encryptedData, session_key, iv);
        const phone = phoneData.phoneNumber;

        // 查询或创建用户
        let user = await getUserByOpenid(openid);

        if (!user) {
            user = await createUser({
                openid,
                sessionKey: session_key,
                phone,
                createTime: new Date().toISOString()
            });
        } else {
            user = await updateUser(user.id, {
                sessionKey: session_key,
                phone,
                lastLoginTime: new Date().toISOString()
            });
        }

        // 生成 token
        const token = generateToken({
            userId: user.id,
            openid: user.openid,
            phone
        });

        res.json({
            code: 0,
            msg: '登录成功',
            data: {
                userId: user.id,
                token,
                phone,
                openid: user.openid
            }
        });
    } catch (error) {
        console.error('手机号登录失败:', error);
        res.json({
            code: -1,
            msg: error.message || '登录失败'
        });
    }
});

/**
 * 检查 token 有效性
 * POST /api/auth/check
 * Header: Authorization: Bearer {token}
 */
router.post('/check', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.json({
                code: -1,
                msg: '未提供token'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.json({
                code: -1,
                msg: 'token无效或已过期'
            });
        }

        const user = await getUser(decoded.userId);

        if (!user) {
            return res.json({
                code: -1,
                msg: '用户不存在'
            });
        }

        res.json({
            code: 0,
            msg: 'token有效',
            data: {
                userId: user.id,
                phone: user.phone,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('token验证失败:', error);
        res.json({
            code: -1,
            msg: 'token验证失败'
        });
    }
});

/**
 * 更新用户信息
 * POST /api/auth/update-profile
 * Header: Authorization: Bearer {token}
 * Body: { nickName, avatarUrl }
 */
router.post('/update-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.json({
                code: -1,
                msg: '未提供token'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.json({
                code: -1,
                msg: 'token无效或已过期'
            });
        }

        const { nickName, avatarUrl } = req.body;
        const updateData = {};

        if (nickName) updateData.nickName = nickName;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        const user = await updateUser(decoded.userId, updateData);

        res.json({
            code: 0,
            msg: '更新成功',
            data: {
                userId: user.id,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        console.error('更新用户信息失败:', error);
        res.json({
            code: -1,
            msg: error.message || '更新失败'
        });
    }
});

/**
 * 解密微信加密数据
 */
function decryptData(encryptedData, sessionKey, iv) {
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    decipher.setAutoPadding(true);

    let decoded = decipher.update(encryptedDataBuffer, null, 'utf8');
    decoded += decipher.final('utf8');

    return JSON.parse(decoded);
}

module.exports = router;
