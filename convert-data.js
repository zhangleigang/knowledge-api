/**
 * 将小程序的 knowledge.js 转换为 API 服务的数据格式
 */

const fs = require('fs');
const path = require('path');

// 读取小程序的 knowledge.js 文件
const knowledgeJsPath = path.join(__dirname, '../utils/knowledge.js');

// 直接 require 知识库文件
let categories, questions;
try {
    const knowledgeModule = require(knowledgeJsPath);
    categories = knowledgeModule.categories;
    questions = knowledgeModule.topics || knowledgeModule.questions; // 兼容 topics 和 questions

    if (!categories || !questions) {
        throw new Error('数据格式不正确：缺少 categories 或 topics/questions');
    }

    console.log(`📖 读取知识库文件成功`);
    console.log(`📁 分类数: ${categories.length}`);
    console.log(`📊 题目数: ${questions.length}`);
} catch (error) {
    console.error('❌ 无法解析 knowledge.js 文件:', error.message);
    process.exit(1);
}

// 创建数据目录
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 生成知识库数据文件
const knowledgeData = {
    version: '1.0.0',
    updateTime: new Date().toISOString(),
    categories,
    questions
};

// 写入 JSON 文件（用于备份和查看）
fs.writeFileSync(
    path.join(dataDir, 'knowledge.json'),
    JSON.stringify(knowledgeData, null, 2),
    'utf-8'
);

// 写入 JS 模块文件（用于 Node.js 服务）
const jsContent = `/**
 * 大数据面试知识库数据
 * 自动生成于: ${new Date().toISOString()}
 * 题目总数: ${questions.length}
 * 分类总数: ${categories.length}
 */

module.exports = ${JSON.stringify(knowledgeData, null, 2)};
`;

fs.writeFileSync(
    path.join(dataDir, 'knowledge.js'),
    jsContent,
    'utf-8'
);

console.log('✅ 数据转换完成！');
console.log(`📁 输出目录: ${dataDir}`);
console.log(`📊 题目总数: ${questions.length}`);
console.log(`📁 分类总数: ${categories.length}`);
console.log(`\n生成的文件:`);
console.log(`  - data/knowledge.json (JSON 格式)`);
console.log(`  - data/knowledge.js   (Node.js 模块)`);
