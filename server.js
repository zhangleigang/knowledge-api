const express = require('express');
const cors = require('cors');
const compression = require('compression');
const knowledgeData = require('./data/knowledge');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors()); // 允许跨域
app.use(compression()); // 启用 gzip 压缩
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取所有分类
app.get('/api/categories', (req, res) => {
    try {
        res.json({
            code: 0,
            message: 'success',
            data: knowledgeData.categories
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: error.message
        });
    }
});

// 获取所有题目（支持分页和分类筛选）
app.get('/api/questions', (req, res) => {
    try {
        const { category, page = 1, pageSize = 20, keyword } = req.query;
        let questions = knowledgeData.questions;

        // 按分类筛选
        if (category) {
            questions = questions.filter(q => q.categoryKey === category);
        }

        // 按关键词搜索
        if (keyword) {
            const lowerKeyword = keyword.toLowerCase();
            questions = questions.filter(q =>
                q.question.toLowerCase().includes(lowerKeyword) ||
                q.answer.toLowerCase().includes(lowerKeyword)
            );
        }

        // 分页
        const total = questions.length;
        const start = (page - 1) * pageSize;
        const end = start + parseInt(pageSize);
        const paginatedQuestions = questions.slice(start, end);

        res.json({
            code: 0,
            message: 'success',
            data: {
                list: paginatedQuestions,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: error.message
        });
    }
});

// 获取单个题目详情
app.get('/api/questions/:id', (req, res) => {
    try {
        const { id } = req.params;
        const question = knowledgeData.questions.find(q => q.id === parseInt(id));

        if (!question) {
            return res.status(404).json({
                code: -1,
                message: '题目不存在'
            });
        }

        res.json({
            code: 0,
            message: 'success',
            data: question
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: error.message
        });
    }
});

// 获取完整知识库数据（用于小程序首次加载缓存）
app.get('/api/knowledge/full', (req, res) => {
    try {
        res.json({
            code: 0,
            message: 'success',
            data: {
                categories: knowledgeData.categories,
                questions: knowledgeData.questions,
                version: knowledgeData.version || '1.0.0',
                updateTime: knowledgeData.updateTime || new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: error.message
        });
    }
});

// 获取数据版本（用于检查更新）
app.get('/api/knowledge/version', (req, res) => {
    try {
        res.json({
            code: 0,
            message: 'success',
            data: {
                version: knowledgeData.version || '1.0.0',
                updateTime: knowledgeData.updateTime || new Date().toISOString(),
                totalQuestions: knowledgeData.questions.length,
                totalCategories: knowledgeData.categories.length
            }
        });
    } catch (error) {
        res.status(500).json({
            code: -1,
            message: error.message
        });
    }
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        code: -1,
        message: 'API 不存在'
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: -1,
        message: '服务器内部错误'
    });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`🚀 知识库 API 服务已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`📊 题目总数: ${knowledgeData.questions.length}`);
    console.log(`📁 分类总数: ${knowledgeData.categories.length}`);
    console.log(`\n可用的 API 端点:`);
    console.log(`  GET  /health                    - 健康检查`);
    console.log(`  GET  /api/categories            - 获取所有分类`);
    console.log(`  GET  /api/questions             - 获取题目列表（支持分页）`);
    console.log(`  GET  /api/questions/:id         - 获取题目详情`);
    console.log(`  GET  /api/knowledge/full        - 获取完整数据`);
    console.log(`  GET  /api/knowledge/version     - 获取数据版本`);
});
