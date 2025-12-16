# Backups

Папка для резервных копий страниц перед крупными изменениями.

## Структура

```
backups/
├── smart-committer/     # Бекапы страницы Smart Committer
│   └── smart-committer_v1_2025-11-26_17-30.html
└── README.md
```

## Как откатить

1. Найти нужную версию в соответствующей папке
2. Скопировать файл обратно в `projects/`:
   ```powershell
   Copy-Item -Path "backups\smart-committer\smart-committer_v1_2025-11-26_17-30.html" -Destination "projects\smart-committer.html"
   ```

## Именование файлов

`{page-name}_v{version}_{date}_{time}.html`

- `v1` — первая рабочая версия (до редизайна)
- `v2` — после первого этапа редизайна
- и т.д.













