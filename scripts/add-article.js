// Утилита для добавления новых статей в блог
// Использование: node scripts/add-article.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const ARTICLES_JSON = path.join(BLOG_DIR, 'articles.json');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const TEMPLATE_FILE = path.join(BLOG_DIR, 'post-template.html');

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Генерация ID из заголовка (slug)
function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Чтение ввода пользователя
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Создание HTML файла статьи из шаблона
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

    // Сохраняем файл
    const filePath = path.join(POSTS_DIR, articleData.contentFile);
    fs.writeFileSync(filePath, template, 'utf-8');
    
    return filePath;
}

// Форматирование даты
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

// Добавление статьи в JSON
function addArticleToJSON(articleData) {
    let data;
    
    if (fs.existsSync(ARTICLES_JSON)) {
        const jsonContent = fs.readFileSync(ARTICLES_JSON, 'utf-8');
        data = JSON.parse(jsonContent);
    } else {
        data = { articles: [] };
    }

    // Проверка на дубликат ID
    if (data.articles.some(a => a.id === articleData.id)) {
        throw new Error(`Статья с ID "${articleData.id}" уже существует`);
    }

    data.articles.push(articleData);
    
    // Сортируем по дате (новые сверху)
    data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    fs.writeFileSync(ARTICLES_JSON, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// Главная функция
async function addArticle() {
    log('\n📝 Добавление новой статьи в блог\n', 'cyan');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        // Заголовок
        const title = await askQuestion(rl, 'Заголовок статьи: ');
        if (!title) {
            throw new Error('Заголовок обязателен');
        }

        // Генерация ID
        const generatedId = generateId(title);
        log(`\nСгенерированный ID: ${generatedId}`, 'yellow');
        const id = await askQuestion(rl, 'ID статьи (Enter для использования сгенерированного): ') || generatedId;

        // Дата
        const today = new Date().toISOString().split('T')[0];
        const dateInput = await askQuestion(rl, `Дата публикации (YYYY-MM-DD, Enter для ${today}): `) || today;

        // Теги
        const tagsInput = await askQuestion(rl, 'Теги (через запятую): ');
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

        // Краткое описание
        const excerpt = await askQuestion(rl, 'Краткое описание (excerpt): ');

        // Время чтения
        const readTimeInput = await askQuestion(rl, 'Время чтения в минутах (по умолчанию 5): ');
        const readTime = parseInt(readTimeInput) || 5;

        // Статус
        const statusInput = await askQuestion(rl, 'Статус (published/draft, по умолчанию draft): ');
        const status = statusInput || 'draft';

        if (!['published', 'draft'].includes(status)) {
            throw new Error('Статус должен быть "published" или "draft"');
        }

        // Иконка
        log('\nДоступные иконки:', 'cyan');
        const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
        if (fs.existsSync(iconsDir)) {
            const icons = fs.readdirSync(iconsDir)
                .filter(f => f.endsWith('.svg'))
                .map(f => f.replace('icon-', '').replace('.svg', ''));
            log(icons.join(', '), 'yellow');
        }
        const iconInput = await askQuestion(rl, 'Иконка (например: robot, shield, chart): ');
        const icon = iconInput ? `icon-${iconInput}.svg` : 'icon-brain.svg';

        // Формируем данные статьи
        const fileName = `${dateInput}-${id}.html`;
        const articleData = {
            id: id,
            title: title,
            date: dateInput,
            tags: tags,
            excerpt: excerpt,
            contentFile: `blog/posts/${fileName}`,
            status: status,
            readTime: readTime,
            icon: icon
        };

        // Создаем директорию posts, если её нет
        if (!fs.existsSync(POSTS_DIR)) {
            fs.mkdirSync(POSTS_DIR, { recursive: true });
        }

        // Создаем HTML файл
        log('\n📄 Создание HTML файла статьи...', 'cyan');
        const filePath = createArticleFile(articleData);
        log(`✅ Файл создан: ${filePath}`, 'green');

        // Добавляем в JSON
        log('\n📝 Добавление в articles.json...', 'cyan');
        addArticleToJSON(articleData);
        log('✅ Статья добавлена в articles.json', 'green');

        log('\n' + '='.repeat(50), 'cyan');
        log('\n✅ Статья успешно добавлена!', 'green');
        log(`\nФайл статьи: ${filePath}`, 'cyan');
        log(`Статус: ${status}`, 'cyan');
        log(`\nДля публикации измените статус на "published" в articles.json`, 'yellow');

    } catch (error) {
        log(`\n❌ Ошибка: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Запуск
if (require.main === module) {
    addArticle();
}

module.exports = { addArticle, generateId };

