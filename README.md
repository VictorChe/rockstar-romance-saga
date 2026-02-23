# Rockstar Romance Saga

Игра-симулятор рок-группы: состав, песни, концерты, Suno для генерации треков.

## Локальный запуск

```sh
git clone https://github.com/VictorChe/rockstar-romance-saga.git
cd rockstar-romance-saga
npm i
npm run dev
```

Для генерации треков в Suno локально: скопируйте `.env.example` в `.env` и укажите `VITE_SUNO_API_KEY` (ключ не коммитьте).

## Деплой на Vercel (рекомендуется)

Проект настроен под Vercel: фронт (Vite) + API для Suno в одном репозитории.

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → импортируйте репозиторий.
2. Оставьте **Build Command**: `npm run build`, **Output Directory**: `dist` (подставится из `vercel.json`).
3. **Deploy**.
4. В проекте: **Settings** → **Environment Variables** → добавьте:
   - **Name:** `SUNO_API_KEY`
   - **Value:** ваш ключ Suno ([sunoapi.org/api-key](https://sunoapi.org/api-key))
5. **Redeploy**, чтобы переменная применилась.

При деплое на Vercel фронт и API на одном домене — кнопка «Сгенерировать трек в Suno» вызывает `/api/suno-generate` без дополнительных настроек. Ключ в GitHub не попадает.

Подробнее: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md).

## Редактирование кода

- **Локально:** любой редактор, пушите в GitHub.
- **Lovable:** можно продолжать править проект в [Lovable](https://lovable.dev) и синхронизировать с репозиторием; хостинг при этом — на Vercel.

## Стек

- Vite, TypeScript, React
- shadcn-ui, Tailwind CSS
- Suno API (через прокси на Vercel)
