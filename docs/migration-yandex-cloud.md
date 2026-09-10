# Перенос foliodeck-app: данные в РФ

Цель: публичный сайт на `foliodeck.pro`, персональные данные хранятся в РФ.
LMS (`lms-career`) не затрагивается.

Статус на старте: Next.js 16.3.3 на Vercel Hobby, Postgres — Neon
`eu-central-1` (Франкфурт), картинки — Vercel Blob, функции — `iad1` (США).

---

## ⚠️ План пересмотрен (2026-09-10)

Полный переезд на Yandex Cloud отменён: слишком дорого (~5000₽/мес) и требует
сервера, за которым некому следить (владелец без разработчика).

**Актуальный план:**

- **Приложение остаётся на Vercel** — не трогаем, 0₽, ноль обслуживания.
- **База данных → Timeweb Cloud, PostgreSQL 17, Москва** (~744₽/мес).
  Готово: кластер создан, данные перенесены и проверены
  (`scripts/migrate-to-ru.mjs`), запросы приложения протестированы на новой БД.
- **Картинки (51 файл) → Timeweb Object Storage (S3)** — следующий шаг.
- Разделы 2–6 ниже (VM, Docker, Caddy, systemd, ALB) **больше не актуальны** —
  оставлены для истории. Актуальны: раздел 3.1 (драйвер БД, сделано),
  3.2 (S3, сделано в коде), раздел 4 (миграция данных, сделано).
- Компромисс: приложение на Vercel (за рубежом) читает ПДн из РФ-базы →
  трансграничная передача, нужно уведомление РКН. Бумажный вопрос для юриста.

---

## 1. Что переносим

| Компонент | Сейчас | Станет |
|---|---|---|
| Приложение (Next.js) | Vercel (US/EU edge) | YC Compute Cloud VM + Caddy |
| База (Postgres) | Neon, Франкфурт | YC Managed Service for PostgreSQL, `ru-central1` |
| Картинки (~51 файл) | Vercel Blob | YC Object Storage (S3), бакет `foliodeck-media` |
| Превью карточек (700 URL) | `static.tildacdn.com` | не трогаем (Tilda — РФ) |
| DNS `foliodeck.pro` | — | A-запись на IP виртуалки (или на YC ALB) |
| Внутренний хост админки | `dizain-tashchit-baza.vercel.app` | `base.foliodeck.pro` → та же VM |

### Объём данных (проверено)

- `curators` 700, `curator_tags` 1500, `curator_images` 4
- `designers` 40, `designer_links` 64, `designer_programs` 7, `designer_taxonomy` 362
- `tags` 81, `taxonomy` 63
- `portfolio_submissions` 1 (тестовая)

Схема — обычный Postgres (`serial`, btree, FK `ON DELETE CASCADE`), ничего
Neon-специфичного. Дамп/восстановление — секунды.

Картинки в Vercel Blob: 40 обложек `designers` + 7 обложек `curators` +
4 `curator_images`. Все на одном сторе `1i7pz5nu4kepx30e`.

---

## 2. Целевая архитектура на Yandex Cloud

```
                  Интернет (РФ, без VPN)
                          │
                    foliodeck.pro
                  base.foliodeck.pro
                          │
                 ┌────────▼─────────┐
                 │  Compute VM      │   standard-v3, 2 vCPU(100%) / 2 GB
                 │  Caddy (TLS)     │   Let's Encrypt автоматом
                 │  Next.js standln │   systemd-сервис, порт 3000
                 └───┬──────────┬───┘
        приватная сеть│          │приватная сеть
          ┌───────────▼──┐   ┌───▼───────────────┐
          │ Managed PG   │   │ Object Storage    │
          │ 1 хост       │   │ бакет foliodeck-  │
          │ PG 16, 20 GB │   │ media (public-r)  │
          └──────────────┘   └───────────────────┘
```

Почему VM, а не Serverless Containers: сайт всегда «тёплый», публичные
страницы `force-dynamic` (тяжёлый рендер на каждый запрос) — холодные старты
контейнера били бы по TTFB. VM проще и предсказуемее по цене.

### Ресурсы YC (создаёт владелец аккаунта)

1. **Folder** `foliodeck`, сеть `default` + подсеть в `ru-central1-a`.
2. **Managed Service for PostgreSQL**
   - PostgreSQL 16, окружение `PRODUCTION`
   - класс `s3-c2-m8` (или burstable `b3-c2-m8`) — 2 vCPU / 8 GB, 1 хост
   - хранилище `network-ssd` 20 GB
   - БД `foliodeck`, пользователь `foliodeck_app`
   - **публичный доступ выключен**, только из подсети VM
   - автобэкапы включены (retention 7 дней)
3. **Object Storage** бакет `foliodeck-media`
   - максимальный размер объекта — по умолчанию
   - ACL: `public-read` на префикс `designers/` (или на весь бакет — там только картинки)
   - отдельный сервисный аккаунт `foliodeck-media-writer` с ролью
     `storage.editor` только на этот бакет → статические ключи (`key id` + `secret`)
4. **Compute Cloud VM**
   - платформа `standard-v3`, 2 vCPU (гарантированная доля 100%), 2 GB RAM
   - диск `network-ssd` 20 GB, ОС Ubuntu 24.04 LTS
   - публичный IP (статический — зарезервировать!)
   - SSH-ключ владельца
   - в той же подсети, что и PG
5. **Cloud DNS** (опционально) — зона `foliodeck.pro`, если переносим NS на YC.
   Иначе A-записи у текущего регистратора `.pro`.
6. **Роскомнадзор** — актуализировать уведомление оператора ПДн: место
   хранения — РФ, поставщик — Yandex Cloud. Трансграничной передачи в этой
   схеме нет (обработка целиком в РФ).

### Ориентировочная стоимость (₽/мес)

| Ресурс | ~Цена |
|---|---|
| VM 2 vCPU / 2 GB + 20 GB SSD | 900–1 300 |
| Managed PG 2 vCPU / 8 GB (1 хост) + 20 GB SSD | 3 500–5 000 |
| Object Storage 1 GB + трафик | 50–150 |
| Статический публичный IP | ~150 |
| **Итого** | **~4 800–6 600** (~$55–75) |

Экономвариант: Postgres прямо на VM (поднять RAM до 4 GB, свои `pg_dump`
в cron) → ~1 500 ₽/мес всего, но теряем managed-бэкапы и PITR.

---

## 3. Изменения в коде (ветка `migrate/yandex-cloud`)

Всё за env-флагами — на Vercel ничего не ломается до переключения.

**Сделано в ветке** (build ✓, typecheck ✓, standalone-сервер стартует):

- [x] 3.1 драйвер БД → `postgres` (postgres.js), шим в `client.ts` сохраняет
      сигнатуру вызовов, `src/lib/db/*` не тронуты
- [x] 3.2 хранилище → `src/lib/storage.ts` (S3), переписаны `blob-upload/route.ts`
      и `actions/designers.ts`, удалён `designers/blob.ts`
- [x] 3.3 `output: "standalone"` + `serverExternalPackages: ["postgres"]`,
      `metadataBase` в `layout.tsx` (из `SITE_ORIGIN`)
- [x] `scripts/` (49 Neon-скриптов сидинга) выведены из typecheck —
      legacy, при повторном использовании нужен тот же свап драйвера
- [ ] `Dockerfile`, `.dockerignore`, `Caddyfile`, systemd-юнит — раздел 3.3
- [ ] скрипты миграции данных — раздел 4
- [ ] проверка запросов postgres.js против реальной PG — раздел 5, шаг 2

Осталось проверить руками на реальной PG (не воспроизвести без БД локально):
массивы-параметры `unnest(${a}::int[])` / `= ANY(${a}::int[])`, `Date` vs
строка в `consent_at`/`created_at` при рендере админки.

### 3.1 Драйвер БД: `@neondatabase/serverless` → `postgres` (postgres.js)

- `package.json`: убрать `@neondatabase/serverless`, добавить `postgres`.
- `src/lib/db/client.ts`:
  ```ts
  import postgres from "postgres";
  export const sql = postgres(process.env.DATABASE_URL!, {
    ssl: process.env.PGSSL_CA
      ? { ca: process.env.PGSSL_CA }           // YC root CA
      : "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  ```
- `src/lib/db/*.ts` — API тегированных шаблонов совпадает. Точки, которые
  проверяем на совместимость при тестах против реальной PG:
  - `unnest(${arr}::int[])` и `= ANY(${ids}::int[])` — массивы-параметры
    (`curators.ts`, `designers.ts`)
  - `COUNT(*)::int AS count` → `rows[0].count` как число
  - `RETURNING id` → `rows[0].id`
  - `mapRow(row)` ждёт snake_case — НЕ включать `transform: { column: ... }`
  - `consent_at`/`created_at`: postgres.js вернёт `Date` (Neon отдавал
    строку) — тип `Submission.consentAt: string` фактически не строгий,
    но проверить рендер дат в админке

### 3.2 Хранилище картинок: `@vercel/blob` → S3 (YC Object Storage)

- `package.json`: убрать `@vercel/blob`, добавить `@aws-sdk/client-s3`.
- Новый `src/lib/storage.ts`: клиент S3 (endpoint `https://storage.yandexcloud.net`,
  region `ru-central1`), функции `putObject(key, body, contentType)` →
  `{ url }` и `deleteObjects(urls)`.
- `src/app/api/blob-upload/route.ts` — заменить `put()` на `putObject()`,
  сохранить контракт ответа `{ url }` (клиент `image-upload-field.tsx`
  не меняется). Проверку размера/типа/сессии оставить.
- `src/lib/actions/designers.ts` — `del()` → `deleteObjects()`.
- `src/lib/designers/blob.ts` — `isBlobUrl()` → проверка на наш публичный
  базовый URL из `process.env.MEDIA_PUBLIC_BASE`.
- Env: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
  `S3_SECRET_ACCESS_KEY`, `MEDIA_PUBLIC_BASE`
  (`https://foliodeck-media.storage.yandexcloud.net`).

### 3.3 Сборка под контейнер

- `next.config.ts`: `output: "standalone"`, заодно
  `metadataBase: new URL("https://foliodeck.pro")`.
- `Dockerfile` (multi-stage, `node:22-alpine`, standalone output).
- `.dockerignore`.
- `Caddyfile` (reverse proxy на `localhost:3000`, автоперенаправление
  `www` и выпуск TLS для `foliodeck.pro` + `base.foliodeck.pro`).
- `deploy/foliodeck.service` — systemd-юнит.

### 3.4 Прочее (заодно, необязательно к этой миграции)

- `src/app/(site)/page.tsx` и `layout.tsx`: `force-dynamic` можно оставить —
  на co-located PG это дёшево. (Если позже вернёмся на распределённый хостинг —
  переводить на кеш + `revalidatePath`, который уже есть в actions.)
- Убрать неиспользуемые env Neon Auth (`NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`,
  `NEON_PROJECT_ID`).
- rate-limit / honeypot на форме подачи ([submitPortfolioAction](../src/lib/actions/submissions.ts)).

---

## 4. Скрипты миграции данных

- `scripts/migrate-db.sh` — `pg_dump` из Neon (`--no-owner --no-privileges`)
  → `psql` в YC PG. Затем сверка `COUNT(*)` по всем таблицам.
- `scripts/migrate-images.mjs` — читает 51 URL из БД, качает из Vercel Blob,
  заливает в бакет тем же путём, `UPDATE` трёх колонок
  (`designers.cover_image`, `curators.cover_image`, `curator_images.url`),
  печатает отчёт. Идемпотентно (пропускает уже перенесённые).

Требуется локально: `pg_dump`/`psql` 16 (`brew install postgresql@16`) или
через `docker run postgres:16`.

---

## 5. Порядок переключения (cutover)

Приложение на Vercel продолжает работать до шага 7.

1. **YC**: создать folder, сеть, PG, бакет, VM (раздел 2).
2. **БД**: `scripts/migrate-db.sh` в YC PG. Сверить счётчики строк.
3. **Картинки**: `scripts/migrate-images.mjs`. Открыть 5–10 URL из бакета в браузере.
4. **VM**: установить Docker + Caddy, задеплоить образ с ветки, поднять
   systemd-сервис. Проверить по `http://<IP>` с временным `Host`-заголовком:
   - публичная галерея открывается, картинки из бакета грузятся
   - `/admin` и `/designer` → 404 (при заданном `DESIGNER_HOST`)
5. **DNS**: `base.foliodeck.pro` → IP VM (сначала внутренний хост).
   Проверить вход в админку и базу студентов на нём.
6. **Прогрев**: сутки последить за логами VM и PG (ошибки соединения, пул).
7. **DNS**: `foliodeck.pro` + `www.foliodeck.pro` → IP VM. Caddy выпускает TLS.
   В Vercel — снять домен с проекта (если был привязан). **Не анонсировать
   в момент смены записей** (TTL, 1–2 часа расхождения).
8. **Проверка из РФ без VPN**: мобильный интернет 2–3 операторов
   (МТС/Мегафон/Билайн) — сайт открывается, картинки грузятся, форма
   отправляется.
9. **Юридика**: обновить privacy policy (теперь «база в РФ» — правда),
   актуализировать уведомление РКН.
10. **Вывод из эксплуатации** (через 1–2 недели стабильной работы):
    - снять бэкап Neon → удалить проект Neon
    - убедиться, что в бакете все картинки → удалить Vercel Blob store
    - оставить Vercel-деплой выключенным как холодный резерв на месяц или удалить
    - вынести секреты из `.env.local` в iCloud (сейчас `ADMIN_PASSWORD`,
      `SESSION_SECRET`, ключи — открытым текстом в облачной папке)

---

## 6. Риски и как страхуемся

| Риск | Митигация |
|---|---|
| Ошибка в портировании запросов на postgres.js | Тесты против реальной YC PG до cutover; откат = вернуть Vercel-деплой (Neon ещё жив 1–2 недели) |
| Одна VM = точка отказа, нет авто-восстановления | Managed PG с бэкапами; snapshot диска VM раз в сутки; `Caddyfile`+`compose` в гите — пересоздание VM за ~30 мин |
| Пул соединений к PG исчерпан | `max: 10` на одну VM с запасом; при росте — connection pooler YC (PgBouncer) |
| Замедление/блокировка Object Storage в РФ | `storage.yandexcloud.net` — российский хост, риск низкий; при необходимости — YC CDN перед бакетом |
| Let's Encrypt не выпускает сертификат | DNS без проксирования (не Cloudflare); порт 80 открыт для ACME; фолбэк — YC Certificate Manager |
| Next 16 standalone на своей VM: ISR/кеш на диске | `force-dynamic` пути кеш не пишут; `revalidatePath` работает в рамках процесса; персистентный кеш не требуется |
| Расхождение DNS в окне переключения | Заранее снизить TTL A-записей до 300 сек; переключать в тихое время; не анонсировать |
| Секреты в iCloud | Вынести в env на VM (права `600`) или YC Lockbox; убрать из `.env.local` |

---

## 7. Переменные окружения на VM (`/etc/foliodeck.env`, права 600)

```sh
# --- БД (Managed PostgreSQL, приватный FQDN) ---
DATABASE_URL=postgresql://foliodeck_app:PASSWORD@rc1a-xxxx.mdb.yandexcloud.net:6432/foliodeck?sslmode=verify-full
PGSSL_CA_FILE=/etc/foliodeck/CA.pem     # wget https://storage.yandexcloud.net/cloud-certs/CA.pem
PGPOOL_MAX=10

# --- Object Storage (сервисный аккаунт foliodeck-media-writer) ---
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=foliodeck-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
MEDIA_PUBLIC_BASE=https://foliodeck-media.storage.yandexcloud.net

# --- Приложение ---
SITE_ORIGIN=https://foliodeck.pro
DESIGNER_HOST=base.foliodeck.pro        # внутренний хост: админка + база студентов
SESSION_SECRET=...                       # перенести из текущего Vercel Production
ADMIN_PASSWORD=...                       # перенести из текущего Vercel Production
NODE_ENV=production
PORT=3000

# --- опционально ---
TELEGRAM_BOT_TOKEN=...                    # сейчас в Production не задан
TELEGRAM_CHAT_ID=...
```

`client.ts` читает `PGSSL_CA_FILE` (путь) или `PGSSL_CA` (содержимое PEM).
В контейнере — смонтировать `CA.pem` и указать путь.
