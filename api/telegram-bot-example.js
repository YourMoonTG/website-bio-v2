// Пример интеграции Telegram бота с API блога (Node.js)
// Установка: npm install node-telegram-bot-api axios

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const API_URL = process.env.API_URL || 'http://localhost:3000/api/articles';
const API_KEY = process.env.API_KEY || null; // API ключ для аутентификации (если включена)

// Инициализация бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Состояния пользователей (в продакшене использовать БД)
const userStates = new Map();

// Вспомогательные функции для работы с API
async function createArticle(title, content, tags = [], excerpt = '', status = 'draft') {
    try {
        const headers = {};
        if (API_KEY) {
            headers['X-API-Key'] = API_KEY;
        }
        
        const response = await axios.post(API_URL, {
            title,
            content,
            tags,
            excerpt,
            status
        }, { headers });
        
        return response.data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateArticle(articleId, updates) {
    try {
        const headers = {};
        if (API_KEY) {
            headers['X-API-Key'] = API_KEY;
        }
        
        const response = await axios.put(`${API_URL}/${articleId}`, updates, { headers });
        return response.data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getArticles(status = null) {
    try {
        const url = status ? `${API_URL}?status=${status}` : API_URL;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function publishArticle(articleId) {
    return await updateArticle(articleId, { status: 'published' });
}

// Обработчики команд
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        '👋 Привет! Я бот для управления блогом.\n\n' +
        'Доступные команды:\n' +
        '/new_article - создать новую статью\n' +
        '/list_articles - список статей\n' +
        '/list_drafts - список черновиков\n' +
        '/publish <id> - опубликовать статью\n' +
        '/help - помощь'
    );
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        '📝 Команды бота:\n\n' +
        '/new_article - создать новую статью\n' +
        '/list_articles - показать список всех статей\n' +
        '/list_drafts - показать черновики\n' +
        '/publish <article_id> - опубликовать статью\n' +
        '/help - показать эту справку'
    );
});

bot.onText(/\/new_article/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, { step: 'title' });
    bot.sendMessage(chatId, '📝 Создание новой статьи.\n\nОтправьте заголовок статьи:');
});

bot.onText(/\/list_articles/, async (msg) => {
    const chatId = msg.chat.id;
    const result = await getArticles();
    
    if (!result.success) {
        bot.sendMessage(chatId, '❌ Ошибка при получении статей');
        return;
    }
    
    const articles = result.articles || [];
    
    if (articles.length === 0) {
        bot.sendMessage(chatId, '📭 Статей пока нет');
        return;
    }
    
    let text = '📚 Список статей:\n\n';
    articles.slice(0, 10).forEach(article => {
        const statusEmoji = article.status === 'published' ? '✅' : '📝';
        text += `${statusEmoji} ${article.id}\n`;
        text += `   ${article.title}\n`;
        text += `   📅 ${article.date}\n\n`;
    });
    
    if (articles.length > 10) {
        text += `\n... и еще ${articles.length - 10} статей`;
    }
    
    bot.sendMessage(chatId, text);
});

bot.onText(/\/list_drafts/, async (msg) => {
    const chatId = msg.chat.id;
    const result = await getArticles('draft');
    
    if (!result.success) {
        bot.sendMessage(chatId, '❌ Ошибка при получении статей');
        return;
    }
    
    const articles = result.articles || [];
    
    if (articles.length === 0) {
        bot.sendMessage(chatId, '📭 Черновиков нет');
        return;
    }
    
    let text = '📝 Черновики:\n\n';
    articles.forEach(article => {
        text += `📝 ${article.id}\n`;
        text += `   ${article.title}\n`;
        text += `   📅 ${article.date}\n\n`;
    });
    
    bot.sendMessage(chatId, text);
});

bot.onText(/\/publish (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const articleId = match[1];
    
    const result = await publishArticle(articleId);
    
    if (result.success) {
        bot.sendMessage(chatId, `✅ Статья ${articleId} опубликована!`);
    } else {
        bot.sendMessage(chatId, `❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`);
    }
});

// Обработка текстовых сообщений (для создания статьи)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Пропускаем команды
    if (text && text.startsWith('/')) {
        return;
    }
    
    const state = userStates.get(chatId);
    if (!state) {
        return;
    }
    
    switch (state.step) {
        case 'title':
            userStates.set(chatId, { step: 'content', title: text });
            bot.sendMessage(chatId, '✅ Заголовок сохранен.\n\nОтправьте контент статьи (HTML или текст):');
            break;
            
        case 'content':
            let content = text;
            if (!content.trim().startsWith('<')) {
                content = `<p>${content}</p>`;
            }
            userStates.set(chatId, { ...state, step: 'tags', content });
            bot.sendMessage(chatId, '✅ Контент сохранен.\n\nОтправьте теги через запятую (или /skip для пропуска):');
            break;
            
        case 'tags':
            const tags = text && text !== '/skip' 
                ? text.split(',').map(t => t.trim()).filter(t => t)
                : [];
            userStates.set(chatId, { ...state, step: 'excerpt', tags });
            bot.sendMessage(chatId, '✅ Теги сохранены.\n\nОтправьте краткое описание (excerpt) или /skip:');
            break;
            
        case 'excerpt':
            const excerpt = text && text !== '/skip' ? text.trim() : '';
            
            const result = await createArticle(
                state.title,
                state.content,
                state.tags || [],
                excerpt,
                'draft'
            );
            
            if (result.success) {
                const article = result.article;
                bot.sendMessage(chatId,
                    `✅ Статья создана!\n\n` +
                    `📌 ID: ${article.id}\n` +
                    `📝 Заголовок: ${article.title}\n` +
                    `📅 Дата: ${article.date}\n` +
                    `🏷️ Теги: ${article.tags.join(', ') || 'нет'}\n` +
                    `📊 Статус: ${article.status}\n\n` +
                    `Для публикации используйте:\n` +
                    `/publish ${article.id}`
                );
            } else {
                bot.sendMessage(chatId, `❌ Ошибка при создании статьи: ${result.error || 'Неизвестная ошибка'}`);
            }
            
            userStates.delete(chatId);
            break;
    }
});

console.log('🤖 Telegram бот запущен...');
console.log('📡 Подключение к API:', API_URL);

