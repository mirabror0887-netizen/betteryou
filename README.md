# BetterYou PWA

Персональный русскоязычный прототип трекера питания, веса, замеров и силовых тренировок.

## Что уже работает
- Главная панель с калориями/БЖУ и графиком веса.
- Запись веса, талии и шагов с историей.
- Три тренировки, ввод рабочих весов/повторов/подходов и журнал силовых.
- Дневник питания, встроенные быстрые рецепты и пользовательские блюда.
- Список покупок, экспорт/импорт JSON.
- Настройки профиля и целей.
- PWA-манифест и service worker для установки/базового офлайн-режима.
- Опциональный код входа/синхронизации через Supabase.

## Важно про облако
По умолчанию приложение хранит данные в localStorage конкретного браузера. Это рабочее локальное хранение, но оно **не синхронизирует** устройства. Для облачной синхронизации создай Supabase project и настрой таблицу/политики ниже, затем в приложении открой «Настройки и синхронизация».

### SQL для Supabase
В SQL Editor проекта выполни:

```sql
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "Users can read own data"
on public.user_data for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own data"
on public.user_data for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own data"
on public.user_data for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Вставь Project URL и anon/publishable key. Создай аккаунт или войди, затем нажми «Синхронизировать». В текущем прототипе синхронизация **отправляет текущий снимок** в облако; автоматическое объединение изменений между устройствами и автоматическая загрузка облачного снимка при входе ещё не реализованы. Сначала экспортируй резервную копию, прежде чем тестировать облако. Никогда не используй `service_role` key на клиенте.

## Запуск локально
PWA и service worker работают на localhost или HTTPS, не при открытии `index.html` как `file://`.

1. Распакуй архив.
2. Установи Python 3 (если он ещё не установлен).
3. В каталоге приложения запусти:
   ```bash
   python -m http.server 8080
   ```
4. Открой `http://localhost:8080`.

Для доступа с телефона и установки PWA размести папку на HTTPS-хостинге (например, Netlify, Vercel или GitHub Pages). Для реальной облачной синхронизации настрой Supabase SQL и credentials.

## Ограничения и безопасность
- Значения калорий и макросов — приблизительные; сверяй порции и этикетки.
- Рекомендации в прототипе основаны на простых правилах, а не на подключённой языковой модели.
- Не вводи диагнозы и не тренируйся через боль. Из-за боли в колене после старой травмы обсуди нагрузку с квалифицированным специалистом.
- Не хранить секреты и ключи администратора в коде приложения.
