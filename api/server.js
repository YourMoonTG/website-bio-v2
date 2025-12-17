// API сервер для работы со статьями блога
// Использование: node api/server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const ARTICLES_JSON = path.join(BLOG_DIR, 'articles.json');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const TEMPLATE_FILE = path.join(BLOG_DIR, 'post-template.html');

// Конфигурация аутентификации
const API_KEY = process.env.API_KEY || null; // Установите API_KEY для включения аутентификации
const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true' || API_KEY !== null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Middleware аутентификации (только для модифицирующих операций)
function authenticate(req, res, next) {
    // Если аутентификация отключена, пропускаем
    if (!AUTH_ENABLED) {
        return next();
    }
    
    // GET запросы на чтение статей не требуют аутентификации
    if (req.method === 'GET' && req.path.startsWith('/api/articles') && !req.path.includes('/api/articles/validate')) {
        return next();
    }
    
    // Проверяем API ключ
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({ 
            success: false, 
            error: 'API ключ не предоставлен. Используйте заголовок X-API-Key или Authorization: Bearer <key>' 
        });
    }
    
    if (apiKey !== API_KEY) {
        return res.status(403).json({ 
            success: false, 
            error: 'Неверный API ключ' 
        });
    }
    
    next();
}

// Применяем аутентификацию ко всем API эндпоинтам (кроме GET /api/articles)
app.use('/api', authenticate);

// Утилиты
function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

function createArticleFile(articleData) {
    if (!fs.existsSync(TEMPLATE_FILE)) {
        throw new Error(`Шаблон не найден: ${TEMPLATE_FILE}`);
    }

    let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

    // Заменяем метаданные
    template = template.replace(
        /<meta name="article-id" content="[^"]*">/,
        `<meta name="article-id" content="${articleData.id}">`
    );
    template = template.replace(
        /<meta name="article-date" content="[^"]*">/,
        `<meta name="article-date" content="${articleData.date}">`
    );
    template = template.replace(
        /<meta name="article-tags" content="[^"]*">/,
        `<meta name="article-tags" content="${articleData.tags.join(',')}">`
    );
    template = template.replace(
        /<meta name="article-read-time" content="[^"]*">/,
        `<meta name="article-read-time" content="${articleData.readTime}">`
    );

    // Заменяем заголовок
    template = template.replace(
        /<title>[^<]*<\/title>/,
        `<title>${articleData.title} - Moon</title>`
    );

    // Заменяем заголовок статьи
    template = template.replace(
        /<h1 class="article-title-main"[^>]*>.*?<\/h1>/,
        `<h1 class="article-title-main" id="article-title">${articleData.title}</h1>`
    );

    // Заменяем дату
    const formattedDate = formatDate(articleData.date);
    template = template.replace(
        /<span class="article-date-header"[^>]*>.*?<\/span>/,
        `<span class="article-date-header" id="article-date">${formattedDate}</span>`
    );

    // Заменяем время чтения
    template = template.replace(
        /<span class="article-read-time-header"[^>]*>.*?<\/span>/,
        `<span class="article-read-time-header" id="article-read-time">${articleData.readTime} мин чтения</span>`
    );

    // Заменяем теги
    const tagsHTML = articleData.tags.map(tag => 
        `<span class="article-tag">${tag}</span>`
    ).join('');
    template = template.replace(
        /<div class="article-tags-header"[^>]*>.*?<\/div>/,
        `<div class="article-tags-header" id="article-tags">${tagsHTML}</div>`
    );

    // Заменяем контент
    if (articleData.content) {
        template = template.replace(
            /<div class="article-content" id="article-body">[\s\S]*?<\/div>/,
            `<div class="article-content" id="article-body">${articleData.content}</div>`
        );
    }

    // Сохраняем файл
    const filePath = path.join(POSTS_DIR, articleData.contentFile.split('/').pop());
    fs.writeFileSync(filePath, template, 'utf-8');
    
    return filePath;
}

function loadArticles() {
    if (!fs.existsSync(ARTICLES_JSON)) {
        return { articles: [] };
    }
    const content = fs.readFileSync(ARTICLES_JSON, 'utf-8');
    return JSON.parse(content);
}

function saveArticles(data) {
    fs.writeFileSync(ARTICLES_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ============================================
// API ЭНДПОИНТЫ
// ============================================

// GET /api/articles - Получить все статьи
app.get('/api/articles', (req, res) => {
    try {
        const data = loadArticles();
        const status = req.query.status; // фильтр по статусу
        
        let articles = data.articles || [];
        
        if (status) {
            articles = articles.filter(a => a.status === status);
        }
        
        res.json({ success: true, articles, total: articles.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/articles/:id - Получить статью по ID
app.get('/api/articles/:id', (req, res) => {
    try {
        const data = loadArticles();
        const article = data.articles.find(a => a.id === req.params.id);
        
        if (!article) {
            return res.status(404).json({ success: false, error: 'Статья не найдена' });
        }
        
        // Читаем контент из HTML файла
        const filePath = path.join(__dirname, '..', article.contentFile);
        let content = '';
        
        if (fs.existsSync(filePath)) {
            const html = fs.readFileSync(filePath, 'utf-8');
            const match = html.match(/<div class="article-content" id="article-body">([\s\S]*?)<\/div>/);
            if (match) {
                content = match[1].trim();
            }
        }
        
        res.json({ success: true, article: { ...article, content } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/articles - Создать новую статью
app.post('/api/articles', (req, res) => {
    try {
        const { title, date, tags, excerpt, content, status, readTime, icon } = req.body;
        
        // Валидация
        if (!title) {
            return res.status(400).json({ success: false, error: 'Заголовок обязателен' });
        }
        
        // Генерация ID
        const id = generateId(title);
        
        // Дата по умолчанию - сегодня
        const articleDate = date || new Date().toISOString().split('T')[0];
        
        // Формируем данные статьи
        const fileName = `${articleDate}-${id}.html`;
        const articleData = {
            id: id,
            title: title,
            date: articleDate,
            tags: tags || [],
            excerpt: excerpt || '',
            contentFile: `blog/posts/${fileName}`,
            status: status || 'draft',
            readTime: readTime || 5,
            icon: icon || 'icon-brain.svg',
            content: content || '<p><strong>Статья в разработке.</strong></p>'
        };
        
        // Проверяем на дубликат
        const data = loadArticles();
        if (data.articles.some(a => a.id === id)) {
            return res.status(400).json({ success: false, error: `Статья с ID "${id}" уже существует` });
        }
        
        // Создаем директорию posts, если её нет
        if (!fs.existsSync(POSTS_DIR)) {
            fs.mkdirSync(POSTS_DIR, { recursive: true });
        }
        
        // Создаем HTML файл
        createArticleFile(articleData);
        
        // Добавляем в JSON
        data.articles.push(articleData);
        data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        saveArticles(data);
        
        res.json({ success: true, article: articleData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/articles/:id - Обновить статью
app.put('/api/articles/:id', (req, res) => {
    try {
        const data = loadArticles();
        const articleIndex = data.articles.findIndex(a => a.id === req.params.id);
        
        if (articleIndex === -1) {
            return res.status(404).json({ success: false, error: 'Статья не найдена' });
        }
        
        const existingArticle = data.articles[articleIndex];
        const updates = req.body;
        
        // Обновляем поля
        const updatedArticle = {
            ...existingArticle,
            ...updates,
            id: existingArticle.id, // ID не меняем
            contentFile: existingArticle.contentFile // путь к файлу не меняем
        };
        
        // Если обновлен контент, обновляем HTML файл
        if (updates.content !== undefined) {
            updatedArticle.content = updates.content;
            createArticleFile(updatedArticle);
        }
        
        // Если обновлены метаданные, обновляем HTML файл
        if (updates.title || updates.date || updates.tags || updates.readTime) {
            createArticleFile(updatedArticle);
        }
        
        data.articles[articleIndex] = updatedArticle;
        saveArticles(data);
        
        res.json({ success: true, article: updatedArticle });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/articles/:id - Удалить статью
app.delete('/api/articles/:id', (req, res) => {
    try {
        const data = loadArticles();
        const articleIndex = data.articles.findIndex(a => a.id === req.params.id);
        
        if (articleIndex === -1) {
            return res.status(404).json({ success: false, error: 'Статья не найдена' });
        }
        
        const article = data.articles[articleIndex];
        
        // Удаляем HTML файл
        const filePath = path.join(__dirname, '..', article.contentFile);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Удаляем из JSON
        data.articles.splice(articleIndex, 1);
        saveArticles(data);
        
        res.json({ success: true, message: 'Статья удалена' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/validate - Валидация структуры блога
app.get('/api/validate', (req, res) => {
    try {
        const { validateBlog } = require('../scripts/validate-blog');
        // Здесь можно вызвать валидацию и вернуть результаты
        res.json({ success: true, message: 'Валидация доступна через скрипт validate-blog.js' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 API сервер запущен на http://localhost:${PORT}`);
    console.log(`🔐 Аутентификация: ${AUTH_ENABLED ? 'ВКЛЮЧЕНА' : 'ОТКЛЮЧЕНА'}`);
    if (AUTH_ENABLED) {
        console.log(`   Используйте заголовок X-API-Key или Authorization: Bearer <key>`);
    }
    console.log(`📝 API эндпоинты:`);
    console.log(`   GET    /api/articles - список статей (публичный)`);
    console.log(`   GET    /api/articles/:id - получить статью (публичный)`);
    console.log(`   POST   /api/articles - создать статью ${AUTH_ENABLED ? '(требует API ключ)' : ''}`);
    console.log(`   PUT    /api/articles/:id - обновить статью ${AUTH_ENABLED ? '(требует API ключ)' : ''}`);
    console.log(`   DELETE /api/articles/:id - удалить статью ${AUTH_ENABLED ? '(требует API ключ)' : ''}`);
});

