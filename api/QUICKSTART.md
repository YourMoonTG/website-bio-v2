# Быстрый старт API

## 1. Установка зависимостей

```bash
cd api
npm install
```

## 2. Запуск API сервера

```bash
node server.js
# или
npm start
# или
start-api.cmd
```

API будет доступен на `http://localhost:3000`

## 3. Тестирование API

### Создать статью:
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовая статья",
    "content": "<p>Контент статьи</p>",
    "tags": ["test", "api"],
    "excerpt": "Краткое описание",
    "status": "draft"
  }'
```

### Получить список статей:
```bash
curl http://localhost:3000/api/articles
```

### Опубликовать статью:
```bash
curl -X PUT http://localhost:3000/api/articles/testovaya-statya \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

## 4. Интеграция с Telegram ботом

### Python (aiogram)

1. Установите зависимости:
```bash
pip install aiogram aiohttp
```

2. Отредактируйте `telegram-bot-example.py`:
   - Замените `YOUR_BOT_TOKEN` на токен вашего бота
   - При необходимости измените `API_URL`

3. Запустите бота:
```bash
python telegram-bot-example.py
```

### Node.js

1. Установите зависимости:
```bash
npm install node-telegram-bot-api axios
```

2. Отредактируйте `telegram-bot-example.js`:
   - Замените `YOUR_BOT_TOKEN` на токен вашего бота
   - При необходимости измените `API_URL`

3. Запустите бота:
```bash
node telegram-bot-example.js
```

## 5. Команды Telegram бота

- `/start` - приветствие и список команд
- `/new_article` - создать новую статью (интерактивный режим)
- `/list_articles` - список всех статей
- `/list_drafts` - список черновиков
- `/publish <article_id>` - опубликовать статью
- `/help` - справка

## 6. Пример использования

1. Запустите API сервер: `node api/server.js`
2. Запустите Telegram бота: `python api/telegram-bot-example.py`
3. В Telegram отправьте `/new_article`
4. Следуйте инструкциям бота для создания статьи
5. Опубликуйте статью командой `/publish <article_id>`

## Примечания

- API работает на порту 3000 по умолчанию
- Для продакшена добавьте аутентификацию (см. README.md)
- Все статьи по умолчанию создаются со статусом `draft`

