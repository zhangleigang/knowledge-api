/**
 * 用户数据存储
 * 使用 JSON 文件存储用户数据（简单实现）
 * 生产环境建议使用数据库（MySQL, MongoDB等）
 */

const fs = require('fs');
const path = require('path');

const USER_DATA_FILE = path.join(__dirname, '../data/users.json');

/**
 * 初始化用户数据文件
 */
function initUserData() {
    if (!fs.existsSync(USER_DATA_FILE)) {
        const initialData = {
            users: [],
            nextId: 1
        };
        fs.writeFileSync(USER_DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ 用户数据文件已创建');
    }
}

/**
 * 读取用户数据
 */
function readUserData() {
    try {
        if (!fs.existsSync(USER_DATA_FILE)) {
            initUserData();
        }
        const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取用户数据失败:', error);
        return { users: [], nextId: 1 };
    }
}

/**
 * 写入用户数据
 */
function writeUserData(data) {
    try {
        fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('写入用户数据失败:', error);
        return false;
    }
}

/**
 * 获取用户（通过ID）
 * @param {string|number} userId - 用户ID
 * @returns {Object|null} 用户对象
 */
function getUser(userId) {
    const data = readUserData();
    return data.users.find(u => u.id === userId) || null;
}

/**
 * 获取用户（通过 openid）
 * @param {string} openid - 微信 openid
 * @returns {Object|null} 用户对象
 */
function getUserByOpenid(openid) {
    const data = readUserData();
    return data.users.find(u => u.openid === openid) || null;
}

/**
 * 创建用户
 * @param {Object} userData - 用户数据
 * @returns {Object} 创建的用户对象
 */
function createUser(userData) {
    const data = readUserData();

    const newUser = {
        id: `user_${data.nextId}`,
        ...userData,
        createTime: userData.createTime || new Date().toISOString(),
        lastLoginTime: new Date().toISOString()
    };

    data.users.push(newUser);
    data.nextId++;

    writeUserData(data);

    console.log(`✅ 创建新用户: ${newUser.id}`);
    return newUser;
}

/**
 * 更新用户
 * @param {string|number} userId - 用户ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Object|null} 更新后的用户对象
 */
function updateUser(userId, updateData) {
    const data = readUserData();
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }

    data.users[userIndex] = {
        ...data.users[userIndex],
        ...updateData,
        updateTime: new Date().toISOString()
    };

    writeUserData(data);

    console.log(`✅ 更新用户: ${userId}`);
    return data.users[userIndex];
}

/**
 * 删除用户
 * @param {string|number} userId - 用户ID
 * @returns {boolean} 是否删除成功
 */
function deleteUser(userId) {
    const data = readUserData();
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return false;
    }

    data.users.splice(userIndex, 1);
    writeUserData(data);

    console.log(`✅ 删除用户: ${userId}`);
    return true;
}

/**
 * 获取所有用户
 * @returns {Array} 用户列表
 */
function getAllUsers() {
    const data = readUserData();
    return data.users;
}

/**
 * 获取用户统计
 * @returns {Object} 统计信息
 */
function getUserStats() {
    const data = readUserData();
    return {
        totalUsers: data.users.length,
        nextId: data.nextId
    };
}

// 初始化
initUserData();

module.exports = {
    getUser,
    getUserByOpenid,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserStats
};
