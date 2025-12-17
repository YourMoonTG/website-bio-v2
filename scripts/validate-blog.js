// Скрипт валидации структуры блога
// Использование: node scripts/validate-blog.js

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const ARTICLES_JSON = path.join(BLOG_DIR, 'articles.json');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

// Валидация структуры JSON
function validateJSONStructure(data) {
    const errors = [];
    const warnings = [];

    if (!data.articles || !Array.isArray(data.articles)) {
        errors.push('articles.json должен содержать массив "articles"');
        return { errors, warnings };
    }

    const requiredFields = ['id', 'title', 'date', 'tags', 'excerpt', 'contentFile', 'status', 'readTime', 'icon'];
    const articleIds = new Set();

    data.articles.forEach((article, index) => {
        const articlePrefix = `Статья #${index + 1} (${article.id || 'без ID'})`;

        // Проверка обязательных полей
        requiredFields.forEach(field => {
            if (!(field in article)) {
                errors.push(`${articlePrefix}: отсутствует обязательное поле "${field}"`);
            }
        });

        // Проверка ID
        if (article.id) {
            if (articleIds.has(article.id)) {
                errors.push(`${articlePrefix}: дублирующийся ID "${article.id}"`);
            }
            articleIds.add(article.id);

            // Проверка формата ID (должен быть slug)
            if (!/^[a-z0-9-]+$/.test(article.id)) {
                warnings.push(`${articlePrefix}: ID должен быть в формате slug (только строчные буквы, цифры и дефисы)`);
            }
        }

        // Проверка даты
        if (article.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(article.date)) {
                errors.push(`${articlePrefix}: неверный формат даты "${article.date}" (должен быть YYYY-MM-DD)`);
            } else {
                const date = new Date(article.date);
                if (isNaN(date.getTime())) {
                    errors.push(`${articlePrefix}: невалидная дата "${article.date}"`);
                }
            }
        }

        // Проверка тегов
        if (article.tags) {
            if (!Array.isArray(article.tags)) {
                errors.push(`${articlePrefix}: "tags" должен быть массивом`);
            } else if (article.tags.length === 0) {
                warnings.push(`${articlePrefix}: нет тегов`);
            }
        }

        // Проверка excerpt
        if (article.excerpt) {
            if (article.excerpt.length > 300) {
                warnings.push(`${articlePrefix}: excerpt слишком длинный (${article.excerpt.length} символов, рекомендуется до 300)`);
            }
            if (article.excerpt.length < 50) {
                warnings.push(`${articlePrefix}: excerpt слишком короткий (${article.excerpt.length} символов, рекомендуется от 50)`);
            }
        }

        // Проверка статуса
        if (article.status && !['published', 'draft'].includes(article.status)) {
            errors.push(`${articlePrefix}: неверный статус "${article.status}" (должен быть "published" или "draft")`);
        }

        // Проверка readTime
        if (article.readTime !== undefined) {
            if (typeof article.readTime !== 'number' || article.readTime < 1) {
                warnings.push(`${articlePrefix}: readTime должен быть положительным числом`);
            }
        }

        // Проверка contentFile
        if (article.contentFile) {
            const filePath = path.join(__dirname, '..', article.contentFile);
            if (!fs.existsSync(filePath)) {
                errors.push(`${articlePrefix}: файл статьи не найден "${article.contentFile}"`);
            }
        }
    });

    return { errors, warnings };
}

// Проверка существования файлов статей
function validateArticleFiles(articles) {
    const errors = [];
    const warnings = [];

    articles.forEach(article => {
        if (!article.contentFile) return;

        const filePath = path.join(__dirname, '..', article.contentFile);
        
        if (!fs.existsSync(filePath)) {
            errors.push(`Файл статьи не найден: ${article.contentFile}`);
            return;
        }

        // Проверка, что файл содержит метаданные
        const content = fs.readFileSync(filePath, 'utf-8');
        const articleId = article.id;

        if (!content.includes(`name="article-id"`)) {
            warnings.push(`Файл ${article.contentFile} не содержит мета-тег article-id`);
        } else {
            // Проверка соответствия ID
            const metaMatch = content.match(/name="article-id"\s+content="([^"]+)"/);
            if (metaMatch && metaMatch[1] !== articleId) {
                errors.push(`Несоответствие ID: в JSON "${articleId}", в HTML "${metaMatch[1]}"`);
            }
        }
    });

    return { errors, warnings };
}

// Главная функция валидации
function validateBlog() {
    log('\n🔍 Валидация структуры блога...\n', 'cyan');

    const errors = [];
    const warnings = [];

    // Проверка существования articles.json
    if (!fs.existsSync(ARTICLES_JSON)) {
        logError(`Файл articles.json не найден: ${ARTICLES_JSON}`);
        process.exit(1);
    }

    // Чтение и парсинг JSON
    let data;
    try {
        const jsonContent = fs.readFileSync(ARTICLES_JSON, 'utf-8');
        data = JSON.parse(jsonContent);
    } catch (error) {
        logError(`Ошибка при чтении/парсинге articles.json: ${error.message}`);
        process.exit(1);
    }

    // Валидация структуры
    const structureValidation = validateJSONStructure(data);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Валидация файлов статей
    if (data.articles) {
        const filesValidation = validateArticleFiles(data.articles);
        errors.push(...filesValidation.errors);
        warnings.push(...filesValidation.warnings);
    }

    // Вывод результатов
    log('\n📊 Результаты валидации:\n', 'cyan');

    // Статистика
    const published = data.articles ? data.articles.filter(a => a.status === 'published').length : 0;
    const drafts = data.articles ? data.articles.filter(a => a.status === 'draft').length : 0;
    const total = data.articles ? data.articles.length : 0;

    logInfo(`Всего статей: ${total}`);
    logInfo(`Опубликовано: ${published}`);
    logInfo(`Черновиков: ${drafts}`);

    // Ошибки
    if (errors.length > 0) {
        log('\n❌ Ошибки:\n', 'red');
        errors.forEach(error => logError(error));
    }

    // Предупреждения
    if (warnings.length > 0) {
        log('\n⚠️  Предупреждения:\n', 'yellow');
        warnings.forEach(warning => logWarning(warning));
    }

    // Итог
    log('\n' + '='.repeat(50) + '\n', 'cyan');

    if (errors.length === 0 && warnings.length === 0) {
        logSuccess('Валидация пройдена успешно! Нет ошибок и предупреждений.');
        process.exit(0);
    } else if (errors.length === 0) {
        logWarning(`Валидация завершена с предупреждениями (${warnings.length})`);
        process.exit(0);
    } else {
        logError(`Валидация не пройдена. Найдено ошибок: ${errors.length}`);
        process.exit(1);
    }
}

// Запуск валидации
if (require.main === module) {
    validateBlog();
}

module.exports = { validateBlog };

