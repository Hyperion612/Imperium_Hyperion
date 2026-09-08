# Империя Гиперион · Imperium Hyperion

Добровольное цифровое государство: конституция, электронный паспорт, валюта **Hyper (HY)**,
шесть провинций, иерархия рангов, Великие Собрания, рынок, казначейство и сообщество.

**Гражданство:** заявка через Врата (`#/gate`) → решение Императора на Троне (`#/emperor`)
→ письмо с уникальным ID `HPN-XXXXX` → вход по ID + PIN → оформление паспорта открывает
полный доступ к государству (`#/imperium`).

**Трон:** пока вакантен — совершается коронация (первый визит на `#/emperor`);
далее вход только по государственному ID Императора и его PIN-коду.
Демо-гражданин для осмотра: `HPN-77777` / PIN `1111`.

**Стек:** React 18 · TypeScript · Vite · Tailwind CSS 4 · Supabase

---

## Настройка Supabase (облачная синхронизация)

Проект уже подключён к Supabase: `https://rahrutqeeuiubqhwumdr.supabase.co`

### Шаг 1. Получите ключи API

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard/project/rahrutqeeuiubqhwumdr)
2. Перейдите в **Settings → API**
3. Скопируйте:
   - **Project URL** (уже прописан: `https://rahrutqeeuiubqhwumdr.supabase.co`)
   - **anon public key** (начинается с `eyJ...`)

### Шаг 2. Создайте таблицу `empire_state`

1. В Supabase Dashboard откройте **SQL Editor**
2. Выполните следующий SQL:

```sql
-- Таблица для хранения состояния Империи
create table if not exists public.empire_state (
  id bigint generated always as identity primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Включаем Realtime для мгновенной синхронизации
alter publication supabase_realtime add table public.empire_state;

-- Политика доступа: разрешаем анонимное чтение и запись
-- (для публичного проекта без авторизации)
create policy "Allow anonymous read" on public.empire_state
  for select using (true);

create policy "Allow anonymous insert" on public.empire_state
  for insert with check (true);

create policy "Allow anonymous update" on public.empire_state
  for update using (true);

create policy "Allow anonymous delete" on public.empire_state
  for delete using (true);
```

3. Нажмите **Run** (или Ctrl+Enter)

### Шаг 3. Настройте переменные окружения

Создайте файл `.env` в корне проекта (или отредактируйте существующий):

```env
VITE_SUPABASE_URL=https://rahrutqeeuiubqhwumdr.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_anon_ключ_сюда
```

> **Важно:** замените `ваш_anon_ключ_сюда` на реальный `anon public key` из Шага 1.

### Шаг 4. Пересоберите проект

```bash
npm run build
```

Или для локальной разработки:

```bash
npm run dev
```

### Шаг 5. Проверьте синхронизацию

1. Откройте сайт на телефоне
2. Откройте тот же сайт на ноутбуке
3. Измените данные на одном устройстве (например, одобрите заявку)
4. Через 1-2 секунды изменения появятся на другом устройстве

---

## Как работает синхронизация

- **Автосохранение:** каждые 3 секунды после изменения данных
- **Realtime:** мгновенное получение изменений через WebSocket
- **Конфликты:** последнее изменение побеждает (last-write-wins)
- **Офлайн:** данные сохраняются в localStorage, синхронизация при появлении сети

---

## Локальный запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшен-сборка в dist/
```

## Публикация на GitHub Pages

1. Залейте репозиторий на GitHub
2. **Settings → Pages → Source: GitHub Actions**
3. Workflow `.github/workflows/deploy.yml` соберёт и опубликует автоматически

---

## Структура проекта

```
src/
  lib/
    state.tsx          — ядро состояния Империи (граждане, казна, рынок)
    supabase.ts        — клиент Supabase
    SupabaseSync.tsx   — компонент синхронизации
    life.tsx           — система жизни (дом, работа, крафт, игры)
    lifeData.ts        — таблицы ресурсов, рецептов, улучшений
    data.ts            — данные провинций, статей Хартии, рангов
    hooks.ts           — хуки для анимаций и эффектов
  components/
    PlanetIntro.tsx    — планета с зумом в карту
    Constitution.tsx   — Хартия Империи
    Passport.tsx       — оформление паспорта
    Dashboard.tsx      — главное государство
    EmperorPanel.tsx   — Трон Императора
    Gate.tsx           — Врата (вход/регистрация)
    LifeHome.tsx       — дом гражданина
    LifeWork.tsx       — работа-кликер
    LifeCraft.tsx      — крафт
    LifeGames.tsx      — мини-игры
public/
  flag.png             — флаг Империи
  404.html             — SPA-fallback для GitHub Pages
  .nojekyll            — отключает Jekyll на Pages
```

---

## Лицензия

MIT
