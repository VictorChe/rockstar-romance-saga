# Деплой на Vercel

Один репозиторий: фронт (Vite) и API для Suno. Ключ Suno хранится только в Vercel, в GitHub не попадает.

## Шаги

1. Зайдите на [vercel.com](https://vercel.com), войдите через GitHub.
2. **Add New** → **Project** → выберите репозиторий **rockstar-romance-saga** (или свой форк).
3. Настройки сборки подставляются из `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework: Vite  
   Менять не обязательно — нажмите **Deploy**.
4. После деплоя откройте проект → **Settings** → **Environment Variables**.
5. Добавьте переменную:
   - **Name:** `SUNO_API_KEY`
   - **Value:** ваш API-ключ Suno ([sunoapi.org/api-key](https://sunoapi.org/api-key))
   - **Environments:** Production (и при желании Preview).
6. Сохраните и сделайте **Redeploy** (Deployments → ⋮ у последнего деплоя → **Redeploy**).

Готово. Приложение открывается по ссылке вида `https://ваш-проект.vercel.app`. Кнопка «Сгенерировать трек в Suno» работает: фронт и API на одном домене, переменная `VITE_SUNO_PROXY_URL` не нужна.

## Локальная разработка

- Без ключа: только игра, Suno недоступен.
- С ключом в `.env`: создайте `.env` (не коммитьте), добавьте  
  `VITE_SUNO_API_KEY=ваш_ключ`  
  — запросы пойдут напрямую в Suno с вашего компьютера.

## Кастомный домен

В Vercel: **Settings** → **Domains** → добавьте свой домен и следуйте подсказкам.
