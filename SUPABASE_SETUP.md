# Настройка Supabase для облачной синхронизации

## Шаг 1: Создайте проект на Supabase

1. Зайдите на https://supabase.com
2. Нажмите "Start your project"
3. Создайте новый проект (бесплатный план)
4. Дождитесь завершения создания (2-3 минуты)

## Шаг 2: Получите credentials

1. В проекте перейдите в **Settings → API**
2. Скопируйте:
   - **Project URL** (например: `https://xxxx.supabase.co`)
   - **anon public key** (длинная строка, начинается с `eyJ...`)

## Шаг 3: Создайте таблицу

В **SQL Editor** выполните:

```sql
create table empire_state (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Включите Realtime для таблицы
alter publication supabase_realtime add table empire_state;

-- Разрешите анонимный доступ (для демо)
create policy "Allow anonymous access"
  on empire_state for all
  using (true)
  with check (true);
```

## Шаг 4: Настройте credentials в коде

Откройте `src/lib/supabase.ts` и замените:

```typescript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

На ваши значения из Settings → API.

## Шаг 5: Пересоберите проект

```bash
npm run build
```

## Как это работает

- При первом запуске данные создаются локально
- Кнопка "Экспорт" создаёт код для переноса
- Кнопка "Импорт" загружает данные из другого устройства
- Supabase автоматически синхронизирует изменения в реальном времени

## Преимущества Supabase

- ✅ Бесплатный план: 500 MB базы, 1 GB хранилища
- ✅ Real-time синхронизация без polling
- ✅ PostgreSQL под капотом
- ✅ Автоматические бэкапы
- ✅ CORS настроен из коробки
