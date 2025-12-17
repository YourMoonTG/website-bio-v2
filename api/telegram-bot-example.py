# Пример интеграции Telegram бота с API блога
# Установка: pip install aiogram aiohttp

import asyncio
import os
import aiohttp
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

# Конфигурация
BOT_TOKEN = "YOUR_BOT_TOKEN"  # Замените на токен вашего бота
API_URL = "http://localhost:3000/api/articles"  # URL API сервера
API_KEY = os.getenv("API_KEY", None)  # API ключ для аутентификации (если включена)

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# Состояния для FSM
class ArticleStates(StatesGroup):
    waiting_for_title = State()
    waiting_for_content = State()
    waiting_for_tags = State()
    waiting_for_excerpt = State()


# Вспомогательные функции для работы с API
async def create_article(title, content, tags=None, excerpt=None, status="draft"):
    """Создать новую статью через API"""
    async with aiohttp.ClientSession() as session:
        headers = {"Content-Type": "application/json"}
        if API_KEY:
            headers['X-API-Key'] = API_KEY
        
        data = {
            "title": title,
            "content": content,
            "tags": tags or [],
            "excerpt": excerpt or "",
            "status": status
        }
        
        async with session.post(API_URL, json=data, headers=headers) as response:
            return await response.json()


async def update_article(article_id, updates):
    """Обновить статью через API"""
    async with aiohttp.ClientSession() as session:
        headers = {"Content-Type": "application/json"}
        if API_KEY:
            headers['X-API-Key'] = API_KEY
        
        async with session.put(f"{API_URL}/{article_id}", json=updates, headers=headers) as response:
            return await response.json()


async def get_articles(status=None):
    """Получить список статей"""
    async with aiohttp.ClientSession() as session:
        url = API_URL
        if status:
            url += f"?status={status}"
        
        async with session.get(url) as response:
            return await response.json()


async def publish_article(article_id):
    """Опубликовать статью"""
    return await update_article(article_id, {"status": "published"})


# Обработчики команд
@dp.message(Command("start"))
async def cmd_start(message: Message):
    """Команда /start"""
    await message.answer(
        "👋 Привет! Я бот для управления блогом.\n\n"
        "Доступные команды:\n"
        "/new_article - создать новую статью\n"
        "/list_articles - список статей\n"
        "/publish <id> - опубликовать статью\n"
        "/help - помощь"
    )


@dp.message(Command("help"))
async def cmd_help(message: Message):
    """Команда /help"""
    await message.answer(
        "📝 Команды бота:\n\n"
        "/new_article - создать новую статью\n"
        "/list_articles - показать список всех статей\n"
        "/list_drafts - показать черновики\n"
        "/publish <article_id> - опубликовать статью\n"
        "/help - показать эту справку"
    )


@dp.message(Command("new_article"))
async def cmd_new_article(message: Message, state: FSMContext):
    """Начать создание новой статьи"""
    await message.answer("📝 Создание новой статьи.\n\nОтправьте заголовок статьи:")
    await state.set_state(ArticleStates.waiting_for_title)


@dp.message(ArticleStates.waiting_for_title)
async def process_title(message: Message, state: FSMContext):
    """Обработка заголовка"""
    await state.update_data(title=message.text)
    await message.answer("✅ Заголовок сохранен.\n\nОтправьте контент статьи (HTML или текст):")
    await state.set_state(ArticleStates.waiting_for_content)


@dp.message(ArticleStates.waiting_for_content)
async def process_content(message: Message, state: FSMContext):
    """Обработка контента"""
    # Если это HTML, используем как есть, иначе оборачиваем в <p>
    content = message.text
    if not content.strip().startswith('<'):
        content = f"<p>{content}</p>"
    
    await state.update_data(content=content)
    await message.answer("✅ Контент сохранен.\n\nОтправьте теги через запятую (или /skip для пропуска):")
    await state.set_state(ArticleStates.waiting_for_tags)


@dp.message(ArticleStates.waiting_for_tags)
async def process_tags(message: Message, state: FSMContext):
    """Обработка тегов"""
    data = await state.get_data()
    
    tags = []
    if message.text and message.text.strip() != "/skip":
        tags = [tag.strip() for tag in message.text.split(',')]
    
    await state.update_data(tags=tags)
    await message.answer("✅ Теги сохранены.\n\nОтправьте краткое описание (excerpt) или /skip:")
    await state.set_state(ArticleStates.waiting_for_excerpt)


@dp.message(ArticleStates.waiting_for_excerpt)
async def process_excerpt(message: Message, state: FSMContext):
    """Обработка excerpt и создание статьи"""
    data = await state.get_data()
    
    excerpt = ""
    if message.text and message.text.strip() != "/skip":
        excerpt = message.text.strip()
    
    # Создаем статью через API
    result = await create_article(
        title=data['title'],
        content=data['content'],
        tags=data.get('tags', []),
        excerpt=excerpt,
        status="draft"
    )
    
    if result.get('success'):
        article = result['article']
        await message.answer(
            f"✅ Статья создана!\n\n"
            f"📌 ID: {article['id']}\n"
            f"📝 Заголовок: {article['title']}\n"
            f"📅 Дата: {article['date']}\n"
            f"🏷️ Теги: {', '.join(article['tags']) if article['tags'] else 'нет'}\n"
            f"📊 Статус: {article['status']}\n\n"
            f"Для публикации используйте:\n"
            f"/publish {article['id']}"
        )
    else:
        await message.answer(f"❌ Ошибка при создании статьи: {result.get('error', 'Неизвестная ошибка')}")
    
    await state.clear()


@dp.message(Command("list_articles"))
async def cmd_list_articles(message: Message):
    """Показать список всех статей"""
    result = await get_articles()
    
    if not result.get('success'):
        await message.answer("❌ Ошибка при получении статей")
        return
    
    articles = result.get('articles', [])
    
    if not articles:
        await message.answer("📭 Статей пока нет")
        return
    
    text = "📚 Список статей:\n\n"
    for article in articles[:10]:  # Показываем первые 10
        status_emoji = "✅" if article['status'] == 'published' else "📝"
        text += f"{status_emoji} {article['id']}\n"
        text += f"   {article['title']}\n"
        text += f"   📅 {article['date']}\n\n"
    
    if len(articles) > 10:
        text += f"\n... и еще {len(articles) - 10} статей"
    
    await message.answer(text)


@dp.message(Command("list_drafts"))
async def cmd_list_drafts(message: Message):
    """Показать список черновиков"""
    result = await get_articles(status="draft")
    
    if not result.get('success'):
        await message.answer("❌ Ошибка при получении статей")
        return
    
    articles = result.get('articles', [])
    
    if not articles:
        await message.answer("📭 Черновиков нет")
        return
    
    text = "📝 Черновики:\n\n"
    for article in articles:
        text += f"📝 {article['id']}\n"
        text += f"   {article['title']}\n"
        text += f"   📅 {article['date']}\n\n"
    
    await message.answer(text)


@dp.message(Command("publish"))
async def cmd_publish(message: Message):
    """Опубликовать статью"""
    parts = message.text.split()
    if len(parts) < 2:
        await message.answer("❌ Укажите ID статьи: /publish <article_id>")
        return
    
    article_id = parts[1]
    result = await publish_article(article_id)
    
    if result.get('success'):
        await message.answer(f"✅ Статья {article_id} опубликована!")
    else:
        await message.answer(f"❌ Ошибка: {result.get('error', 'Неизвестная ошибка')}")


# Запуск бота
async def main():
    print("🤖 Telegram бот запущен...")
    print("📡 Подключение к API:", API_URL)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())

