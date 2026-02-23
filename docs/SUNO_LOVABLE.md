# Ключ Suno в Lovable (без публикации в GitHub)

**Lovable Cloud — платная функция.** Если вы на бесплатном тарифе, используйте вариант с Vercel: **[SUNO_BESPLATNO_VERCEL.md](SUNO_BESPLATNO_VERCEL.md)**.

Чтобы приложение в Lovable могло генерировать треки в Suno, но **никто не видел ключ в GitHub** (при наличии Lovable Cloud):

## 1. Включите Lovable Cloud для проекта

- Откройте проект в [Lovable](https://lovable.dev).
- Убедитесь, что включён **Lovable Cloud** (вкладка Cloud в проекте). Если нет — включите в настройках: **Settings → Connectors → Lovable Cloud**.

## 2. Добавьте ключ в Secrets (не в код и не в репозиторий)

- В проекте откройте вкладку **Cloud** (кнопка «+» рядом с Preview).
- Перейдите в раздел **Secrets** (или **Environment / Secrets** в настройках Cloud).
- Нажмите **Add secret** (или «Добавить секрет»).
- Имя: **`SUNO_API_KEY`** (именно так — его читает Edge Function).
- Значение: ваш API-ключ Suno (получить: [sunoapi.org/api-key](https://sunoapi.org/api-key)).
- Сохраните.

Ключ хранится только на серверах Lovable, в браузер и в репозиторий он не попадает.

## 3. Не добавляйте ключ в GitHub

- **Не** коммитьте файл `.env` с ключом.
- **Не** вставляйте ключ в код и **не** пишите его в чат Lovable (Lovable может предупредить об этом).
- В репозитории уже есть `.env.example` без ключа и `.gitignore` для `.env`.

## Как это устроено

- В репозитории лежит **Edge Function** `supabase/functions/suno-generate`: она вызывает API Suno на сервере.
- Ключ Suno подставляется в эту функцию из **Secrets** при запуске в Lovable Cloud.
- Фронт в браузере вызывает только ваш бэкенд (Edge Function), ключ Suno во фронт не передаётся.

## Локальная разработка

Локально (без Lovable Cloud) можно по-прежнему использовать `.env` с переменной **`VITE_SUNO_API_KEY`**. Тогда запросы идут напрямую в Suno с вашего компьютера. Файл `.env` не коммитьте.
