# API для блога

API сервер для управления статьями блога через HTTP запросы. Предназначен для интеграции с Telegram ботом и другими внешними сервисами.

## Установка

```bash
npm install express cors
```

## Запуск

```bash
node api/server.js
```

Сервер запустится на `http://localhost:3000`

## API Эндпоинты

### GET /api/articles

Получить список всех статей.

**Параметры запроса:**
- `status` (опционально) - фильтр по статусу (`published` или `draft`)

**Пример:**
```bash
GET /api/articles
GET /api/articles?status=published
```

**Ответ:**
```json
{
  "success": true,
  "articles": [...],
  "total": 3
}
```

---

### GET /api/articles/:id

Получить статью по ID.

**Пример:**
```bash
GET /api/articles/telegram-ecosystems
```

**Ответ:**
```json
{
  "success": true,
  "article": {
    "id": "telegram-ecosystems",
    "title": "...",
    "content": "...",
    ...
  }
}
```

---

### POST /api/articles

Создать новую статью.

**Тело запроса:**
```json
{
  "title": "Заголовок статьи",
  "date": "2024-12-20",
  "tags": ["tag1", "tag2"],
  "excerpt": "Краткое описание",
  "content": "<p>HTML контент статьи</p>",
  "status": "draft",
  "readTime": 5,
  "icon": "icon-robot.svg"
}
```

**Обязательные поля:**
- `title` - заголовок статьи

**Опциональные поля:**
- `date` - дата публикации (по умолчанию: сегодня)
- `tags` - массив тегов
- `excerpt` - краткое описание
- `content` - HTML контент статьи
- `status` - статус (`published` или `draft`, по умолчанию: `draft`)
- `readTime` - время чтения в минутах (по умолчанию: 5)
- `icon` - иконка (по умолчанию: `icon-brain.svg`)

**Пример:**
```bash
POST /api/articles
Content-Type: application/json

{
  "title": "Новая статья",
  "tags": ["python", "telegram"],
  "excerpt": "Описание статьи",
  "content": "<p>Контент статьи</p>",
  "status": "published"
}
```

**Ответ:**
```json
{
  "success": true,
  "article": { ... }
}
```

---

### PUT /api/articles/:id

Обновить существующую статью.

**Тело запроса:**
```json
{
  "title": "Обновленный заголовок",
  "content": "<p>Обновленный контент</p>",
  "status": "published",
  ...
}
```

Можно обновить любое поле статьи.

**Пример:**
```bash
PUT /api/articles/telegram-ecosystems
Content-Type: application/json

{
  "status": "published",
  "content": "<p>Новый контент</p>"
}
```

---

### DELETE /api/articles/:id

Удалить статью.

**Пример:**
```bash
DELETE /api/articles/telegram-ecosystems
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статья удалена"
}
```

---

## Интеграция с Telegram ботом

### Пример использования (Python aiogram)

```python
import aiohttp
import json

API_URL = "http://localhost:3000/api/articles"

async def create_article(title, content, tags=None):
    async with aiohttp.ClientSession() as session:
        data = {
            "title": title,
            "content": content,
            "tags": tags or [],
            "status": "draft"
        }
        async with session.post(API_URL, json=data) as response:
            return await response.json()

async def publish_article(article_id):
    async with aiohttp.ClientSession() as session:
        data = {"status": "published"}
        async with session.put(f"{API_URL}/{article_id}", json=data) as response:
            return await response.json()
```

### Пример использования (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/articles';

async function createArticle(title, content, tags = []) {
    const response = await axios.post(API_URL, {
        title,
        content,
        tags,
        status: 'draft'
    });
    return response.data;
}

async function publishArticle(articleId) {
    const response = await axios.put(`${API_URL}/${articleId}`, {
        status: 'published'
    });
    return response.data;
}
```

## Безопасность

### Аутентификация

API поддерживает аутентификацию через API ключ. Для включения:

1. Установите переменную окружения `API_KEY`:
```bash
export API_KEY=your-secret-key-here
# или
set API_KEY=your-secret-key-here  # Windows
```

2. Или установите `AUTH_ENABLED=true`:
```bash
export AUTH_ENABLED=true
```

**Важно:**
- GET запросы на чтение статей (`/api/articles`, `/api/articles/:id`) **не требуют** аутентификации (публичные)
- Все модифицирующие операции (POST, PUT, DELETE) **требуют** API ключ, если аутентификация включена

**Использование API ключа:**

```bash
# Через заголовок X-API-Key
curl -X POST http://localhost:3000/api/articles \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Новая статья"}'

# Или через Authorization Bearer
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Новая статья"}'
```

### Дополнительные меры безопасности (планируется)

1. ✅ API ключи или токены - **РЕАЛИЗОВАНО**
2. ⏳ Rate limiting (ограничение количества запросов)
3. ⏳ Валидация входных данных (sanitization)
4. ⏳ Логирование запросов
5. ⏳ IP whitelist для дополнительной защиты

## Обработка ошибок

Все эндпоинты возвращают JSON с полем `success`:
- `success: true` - операция успешна
- `success: false` - произошла ошибка, поле `error` содержит описание

Коды статусов:
- `200` - успех
- `400` - ошибка валидации
- `404` - статья не найдена
- `500` - внутренняя ошибка сервера

