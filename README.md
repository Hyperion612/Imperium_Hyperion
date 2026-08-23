# Империя Гиперион · Imperium Hyperion

Добровольное цифровое государство: конституция, цифровой паспорт, валюта **Hyper (HY)**,
пять провинций, иерархия рангов, Великие Собрания и сообщество.

**Стек:** React 18 · TypeScript · Vite · Tailwind CSS 4

## Локальный запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшен-сборка в dist/
```

## Публикация на GitHub Pages (автоматически)

1. Залейте этот репозиторий на GitHub (`git push origin main`).
2. Откройте **Settings → Pages** репозитория.
3. В поле **Source** выберите **GitHub Actions** (не «Deploy from a branch»!).
4. Готово: каждый `push` в `main` собирает и публикует сайт через
   workflow `.github/workflows/deploy.yml`.

Сайт: `https://<username>.github.io/<repo>/`

> ⚠️ Важно: в `vite.config.js` установлен `base: "./"` — без него сборка
> генерирует абсолютные пути `/assets/...`, которые на GitHub Pages дают 404
> и **белый экран**. Если собираете вручную (`npm run build`) и загружаете
> содержимое `dist/` сами — кладите файлы в **корень** ветки, публикуемой
> Pages, вместе с `404.html` и `.nojekyll`.

## Структура

```
src/
  lib/          данные Империи, хуки (scroll-сцены, scramble, counter)
  components/   сцена планеты→карты, конституция, паспорт, казначейство,
                ранги, собрания, сообщество, навигация
public/         404.html (SPA-fallback), .nojekyll
```
