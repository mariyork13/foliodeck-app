# Foliodeck — полное техническое описание

Последнее обновление: 2026-09-10.

Документ описывает проект `foliodeck-app` целиком: логику, все технические
элементы, подключения и договорённости — так, чтобы систему можно было
восстановить с нуля. Разделён на **Сайт** (публичная часть) и **Админку**
(внутренняя часть). В конце — runbook «Восстановление с нуля».

---

## 1. Что это за проект

**Foliodeck** — публичная кураторская галерея портфолио дизайнеров, разработчиков
и студий. Домен: **https://foliodeck.pro**.

Внутри того же приложения живёт **вторая, закрытая часть** — база выпускников
курса «Дизайн тащит» («Школа ДТ») и вся админка. Она доступна только по
внутреннему адресу и под паролем.

Одно Next.js-приложение, один репозиторий, один деплой — но **два хоста**,
разделённые по назначению (см. §3).

Оператор ПДн и владелец: Мария Чубина.

---

## 2. Технологический стек

| Слой | Технология | Версия |
|---|---|---|
| Фреймворк | Next.js (App Router) | 16.3.3 |
| Runtime | React / React DOM | 19.2.8 |
| Язык | TypeScript | 5.x |
| Стили | Tailwind CSS | 4.x (через `@tailwindcss/postcss`) |
| БД-драйвер | `postgres` (postgres.js) | ^3.4.9 |
| Объектное хранилище | `@aws-sdk/client-s3` | ^3.x |
| Иконки брендов | `simple-icons` | ^16.x |
| Хостинг | Vercel (план Hobby) | — |
| База данных | Timeweb Cloud — Managed PostgreSQL | 17, 2 ГБ, Москва |
| Хранилище картинок | Timeweb Cloud — Object Storage (S3) | Санкт-Петербург |
| Домен | reg.ru | — |
| Уведомления | Telegram Bot API | опционально |

Ключевые файлы конфигурации:
- `next.config.ts` — `devIndicators: false`, `serverExternalPackages: ["postgres"]`.
- `AGENTS.md` / `CLAUDE.md` — служебный блок, дописывается `next dev`, не трогать.
- `src/proxy.ts` — middleware (в Next 16 переименован из `middleware.ts`).

Скрипты:
- `npm run dev` — локальная разработка.
- `npm run build` — прод-сборка.
- `npm run lint` — ESLint.

Каталог `scripts/` — одноразовые скрипты миграции и сидинга (часть на старом
драйвере Neon, помечены как legacy; исключены из typecheck в `tsconfig.json`).

---

## 3. Архитектура и хостинг

### 3.1 Схема

```
                        Интернет
                           │
        ┌──────────────────┼───────────────────────┐
        │                  │                       │
  foliodeck.pro     www.foliodeck.pro        dizain-tashchit-baza
  (публичный)       (307 → apex)             .vercel.app (внутренний)
        │                  │                       │
        └──────────┬───────┴───────────────────────┘
                   │  Vercel (проект foliodeck-app, team mariyork, Hobby)
                   │  Функции в регионе iad1 (США, Вашингтон)
                   │
        ┌──────────┴──────────┐
        │                     │
  Timeweb PostgreSQL     Timeweb Object Storage (S3)
  Москва, 2 ГБ           СПб, бакет foliodeck-media
  200 подключений        s3.twcstorage.ru
```

Дополнительно всегда живёт технический адрес `foliodeck-app.vercel.app`
(тоже «публичный» хост — ведёт себя как `foliodeck.pro`).

### 3.2 Разделение на два хоста — `src/proxy.ts`

Разделение задаётся переменной окружения **`DESIGNER_HOST`**
(= `dizain-tashchit-baza.vercel.app`).

| Хост | `/` | `/curator/*`, инфо-страницы | `/admin/*` | `/designer/*` | `/api/*` |
|---|---|---|---|---|---|
| **Публичный** (`foliodeck.pro`, `foliodeck-app.vercel.app`) | галерея | ✅ | **404** | **404** | ✅ |
| **Внутренний** (`DESIGNER_HOST`) | rewrite → `/designer` (база выпускников) | **404** | ✅ (под паролем) | ✅ (под паролем) | ✅ |

Логика `proxy()`:
1. **Изоляция хостов.** На публичном хосте пути `/admin*` и `/designer*` → 404.
   На внутреннем хосте всё, кроме `/`, `/admin*`, `/designer*`, `/api/*` → 404.
2. **Гейт авторизации.** `/admin*` (кроме `/admin/login`) и `/designer*`
   требуют валидную сессионную куку; иначе redirect на `/admin/login`.
   На внутреннем хосте `/` приравнивается к `/designer` для проверки.
3. **Rewrite.** На внутреннем хосте `/` внутренне переписывается на `/designer`.
4. Если `DESIGNER_HOST` **не задана** (локальная разработка) — всё доступно
   на любом хосте, никаких rewrite. Single-host режим.

`matcher`: всё, кроме `_next/static`, `_next/image`, `favicon.ico`, `icon.svg`.

> Server Actions матчер middleware покрывает ненадёжно, поэтому **каждый
> админский Server Action дополнительно сам зовёт `requireAdminSession()`**
> (`src/lib/admin-auth.ts`).

### 3.3 Деплой

- Репозиторий: **`github.com/mariyork13/foliodeck-app`**, ветка `main`.
- Vercel подключён к репо: **push в `main` → автоматический прод-деплой**.
- Preview-деплои — на любые другие ветки.
- Все три хоста (`foliodeck.pro`, `www`, `dizain-tashchit-baza.vercel.app`,
  `foliodeck-app.vercel.app`) привязаны к окружению **Production** и алиасятся
  на последний прод-деплой.

---

## 4. Внешние сервисы и аккаунты

| Сервис | Назначение | Детали |
|---|---|---|
| **Vercel** | Хостинг приложения | Аккаунт `mariyork` (Hobby). Проект `foliodeck-app` (`prj_fJAigWUJrpS4AVoILiiMnMLIaiVR`). Team `team_o3z9q8g7h77NnpGn8Z1tjwCX`. |
| **GitHub** | Репозиторий + CI-триггер | `mariyork13/foliodeck-app`, ветка `main`. |
| **Timeweb Cloud — PostgreSQL** | Основная БД | Кластер `foliodeck-db`. PostgreSQL 17. Конфигурация 1×3.3 ГГц / 2 ГБ / 20 ГБ NVMe (~790 ₽/мес). Регион Москва. Без реплик. Физические бэкапы включены (раз в день). `max_connections` = 200. Доменный хост `6d394c2bf35e4d2176e48e44.twc1.net:5432`, БД `default_db`, пользователь `gen_user`. |
| **Timeweb Cloud — Object Storage (S3)** | Загруженные картинки | Бакет `foliodeck-media` (публичный), регион СПб (`ru-1`). Endpoint `https://s3.twcstorage.ru`, path-style. Публичный URL: `https://s3.twcstorage.ru/foliodeck-media/<key>`. Отдельный сервисный аккаунт со статическими ключами Access/Secret. |
| **reg.ru** | Регистратор домена `foliodeck.pro` | Зарегистрирован до 22.01.2027. NS: `ns1.reg.ru`, `ns2.reg.ru`. DNS-зона у reg.ru (без Cloudflare — принципиально). |
| **Telegram Bot API** | Уведомления о новых заявках | Опционально. Переменные `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`. Сейчас в Production **не заданы** — уведомления отключены. |
| **Neon** (устаревает) | Старая БД (Франкфурт) | Оставлена как страховка на ~2 недели после миграции 2026-09-10, затем удалить. Интеграция Vercel–Neon всё ещё висит в проекте, её переменные (`POSTGRES_*`, `PG*`, `NEON_*`, `DATABASE_URL`) приложением **не используются**. |
| **Vercel Blob** (устаревает) | Старое хранилище картинок | Стор `store_1I7pz5nu4KeP…`. Оставлен как страховка, затем удалить. |

**DNS-записи `foliodeck.pro` (у reg.ru):**
```
A  @    → 216.198.79.1     (актуальный IP Vercel; legacy 76.76.21.21 тоже работает)
A  www  → 216.198.79.1
```
`www.foliodeck.pro` в Vercel настроен как **307-редирект на `foliodeck.pro`**.
SSL — Let's Encrypt, выпускается Vercel автоматически.

---

## 5. Переменные окружения

Задаются в Vercel (Settings → Environment Variables) для **Production** и
**Preview**. Локально — в `.env.local` (в git не коммитится; `.env*` в
`.gitignore`).

| Переменная | Назначение | Пример / значение |
|---|---|---|
| `DATABASE_URL_RU` | **Основная строка подключения к БД.** Читается первой. | `postgresql://gen_user:<pwd>@6d394c2bf35e4d2176e48e44.twc1.net:5432/default_db` |
| `DATABASE_URL` | Fallback (локально / если `_RU` не задана). Сейчас — управляется интеграцией Neon, приложением фактически не нужна. | — |
| `PGSSL_CA_FILE` / `PGSSL_CA` | Опционально: путь к CA-сертификату Timeweb или его содержимое. Без него — TLS без проверки цепочки (`sslmode=require`). | — |
| `PGPOOL_MAX` | Размер пула postgres.js на один экземпляр функции. По умолчанию **1**. | `1` |
| `S3_ENDPOINT` | Endpoint объектного хранилища | `https://s3.twcstorage.ru` |
| `S3_REGION` | Регион | `ru-1` |
| `S3_BUCKET` | Имя бакета | `foliodeck-media` |
| `S3_ACCESS_KEY_ID` | Ключ доступа S3 | — (секрет) |
| `S3_SECRET_ACCESS_KEY` | Секретный ключ S3 | — (секрет) |
| `MEDIA_PUBLIC_BASE` | Базовый публичный URL бакета | `https://s3.twcstorage.ru/foliodeck-media` |
| `DESIGNER_HOST` | Внутренний хост (разделение публичного/внутреннего) | `dizain-tashchit-baza.vercel.app` |
| `SESSION_SECRET` | Секрет для HMAC сессионной куки админки | — (секрет) |
| `ADMIN_PASSWORD` | Единственный пароль для входа в админку | — (секрет) |
| `SITE_ORIGIN` | Базовый origin для `metadataBase` (OG-теги). По умолчанию `https://foliodeck.pro`. | `https://foliodeck.pro` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота (опционально) | — |
| `TELEGRAM_CHAT_ID` | Chat ID для уведомлений (опционально) | — |

Устаревшие / неиспользуемые (от интеграции Neon, можно удалить после
отключения интеграции): `POSTGRES_*`, `PG*`, `NEON_PROJECT_ID`,
`NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`, `DATABASE_URL_UNPOOLED`,
`BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY`, `BLOB_READ_WRITE_TOKEN`.

---

## 6. База данных

PostgreSQL 17. Драйвер — **postgres.js**, инициализируется в
`src/lib/db/client.ts`:

```ts
const connectionString = process.env.DATABASE_URL_RU || process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  ssl: ca ? { ca } : "require",
  max: Number(process.env.PGPOOL_MAX ?? 1),
  idle_timeout: 10,
  max_lifetime: 300,
  connect_timeout: 10,
});
```

`sql` экспортируется как тонкая обёртка (шим), совместимая по API с прежним
драйвером `@neondatabase/serverless` — тегированные шаблоны, `RETURNING`,
`COUNT(*)::int`, `unnest(${arr}::int[])`, `= ANY(${arr}::int[])` работают.
Все модули `src/lib/db/*.ts` используют только `sql\`...\``.

### 6.1 Схема (полный DDL)

Актуальный DDL — в `scripts/migrate-to-ru.mjs` (переменная `DDL`). Схема
обычная, портируется на любой PostgreSQL 14+. Никаких расширений (Timeweb
преднастраивает TimescaleDB и pg_cron, но приложение их не использует).

**Публичная галерея:**

```sql
tags (
  id serial PK, type text CHECK(type IN ('specialization','company','collection')),
  name text, logo text, UNIQUE(type,name)
)

curators (
  id serial PK, slug text UNIQUE, name text, role text,
  external_url text, preview_image text,      -- см. §7.4
  cover_image text NULL,                        -- загруженная картинка карточки
  embeddable boolean NULL,                      -- false = сайт не встраивается
  geo text NULL, notes text NULL,
  sort_order integer NOT NULL,                  -- порядок в галерее (можно отриц.)
  created_at timestamptz, updated_at timestamptz
)
curator_tags (curator_id FK→curators, tag_id FK→tags, PK(curator_id,tag_id))   -- N:N
curator_images (id serial PK, curator_id FK→curators, url text, sort_order int) -- legacy, почти пусто
```

**Заявки с публичной формы:**

```sql
portfolio_submissions (
  id serial PK, name, email, contact, specialization, portfolio_url text,
  consent_processing boolean, consent_disclosure boolean,   -- две галочки согласия
  consent_ip text NULL, consent_user_agent text NULL,       -- фиксация согласия
  consent_at timestamptz,
  status text DEFAULT 'new'
    CHECK(status IN ('new','review','approved','published','rejected','removed')),
  admin_note text NULL,
  created_at timestamptz, updated_at timestamptz
)
```

**База выпускников «Дизайн тащит»:**

```sql
taxonomy (
  id serial PK,
  category text CHECK(category IN
    ('platform','business_model','industry','interface_type','skill','company_type')),
  name text, slug text, sort_order integer,
  UNIQUE(category, slug)
)

designers (
  id serial PK, slug text UNIQUE, first_name text, last_name text,
  cover_image text NULL, grade text, years_of_experience integer NULL,
  open_to_work boolean DEFAULT false,
  created_at timestamptz, updated_at timestamptz
)
designer_taxonomy (designer_id FK→designers, taxonomy_id FK→taxonomy, PK(both))  -- N:N
designer_images   (id serial PK, designer_id FK→designers, url, sort_order)
designer_links    (id serial PK, designer_id FK→designers, type, url, sort_order)
designer_programs (id serial PK, designer_id FK→designers, program, cohort, year, sort_order)
```

Все FK — `ON DELETE CASCADE`.

### 6.2 Объём данных (на 2026-09-10)

| Таблица | Строк | | Таблица | Строк |
|---|---|---|---|---|
| curators | ~703 | | designers | 40 |
| curator_tags | ~1511 | | designer_links | 64 |
| curator_images | 4 | | designer_programs | 7 |
| tags | ~84 | | designer_taxonomy | 362 |
| taxonomy | 63 | | designer_images | 0 |
| portfolio_submissions | ~4 (тестовые) | | | |

### 6.3 Слой доступа (`src/lib/db/`)

- `client.ts` — инициализация `sql`.
- `curators.ts` — `getCurators()`, `getCuratorBySlug()`, `getCuratorById()`,
  `getCuratorsPage()`, `createCurator()`, `updateCurator()`, `deleteCurator()`,
  `reorderCurator()`, `countCurators()`. Публичные `get*` обёрнуты в React
  `cache()` (дедуп в рамках одного рендера).
- `tags.ts` — `getTagsByType()`, `getAllTagsGrouped()`,
  `getAllTagsGroupedWithUsage()`, `getDistinctGeoValues()`,
  `getDistinctRoleValues()`, `createTag()`, `renameTag()`, `deleteTag()`,
  `setTagLogo()`.
- `taxonomy.ts` — `getTaxonomyGrouped()`, `getTaxonomyGroupedWithUsage()`,
  `createTaxonomyTerm()`, `renameTaxonomyTerm()`, `deleteTaxonomyTerm()`.
- `designers.ts` — `getDesigners()`, `getDesignerBySlug()`, `getDesignerById()`,
  `getDistinctProgramYears()`, `createDesigner()`, `updateDesigner()`,
  `deleteDesigner()`. Запись детей (`designer_images/links/programs/taxonomy`)
  — через `replaceChildren()`: DELETE всех + INSERT заново (без транзакции).
- `submissions.ts` — `createSubmission()`, `recentSubmissionCounts()`,
  `getSubmissionsPage()`, `getSubmissionById()`, `getSubmissionStatusCounts()`,
  `updateSubmissionStatus()`, `toPublicSafe()`.

---

## 7. САЙТ (публичная часть, `foliodeck.pro`)

### 7.1 Роуты

| Путь | Что | Рендеринг |
|---|---|---|
| `/` | Галерея портфолио | ISR, `revalidate = 120` |
| `/curator/[slug]` | Страница одного портфолио | ISR, `revalidate = 300`, новые slug — по запросу |
| `/about` | «Project» — о проекте | ISR (статика) |
| `/founder` | «Curator» — об основателе | ISR (статика) |
| `/privacy-policy` | Политика обработки ПДн (RU/EN) | ISR (статика) |
| `/personal-data-consent` | Согласие на обработку ПДн (RU/EN) | ISR (статика) |
| `/data-distribution-consent` | Согласие на распространение ПДн (RU/EN) | ISR (статика) |
| `/api/blob-upload` | Приём загрузки картинки → S3 (только под сессией) | dynamic |

Общий layout группы `(site)` — `src/app/(site)/layout.tsx`: шапка + подвал,
`revalidate = 120`. Читает `getCurators()` + `getTagsByType()` ×3 +
`getDistinctGeoValues()` для фильтров и логотипов компаний в шапке.

Корневой layout — `src/app/layout.tsx`: шрифт **Roboto** (self-hosted через
`next/font/google`, latin+cyrillic), `metadataBase` из `SITE_ORIGIN`, тёмный
фон `#161618`. Провайдеры: `LanguageProvider` → `FilterProvider` →
`FavoritesProvider`.

### 7.2 Кеширование (важно)

Публичные страницы — **ISR (Incremental Static Regeneration)**:
- галерея и вся группа `(site)` регенерируются не чаще раза в **2 минуты**;
- страницы кураторов — раз в **5 минут**;
- при правке в админке соответствующие пути инвалидируются немедленно через
  `revalidatePath()` в Server Actions.

Причина: БД (тариф Timeweb) имеет лимит подключений; `force-dynamic` (запрос в
БД на каждый заход) под нагрузкой исчерпывал лимит и валил сайт. ISR обращается
к БД только при регенерации страницы.

> Историческая заметка: пробовали `unstable_cache` — на Vercel он
> периодически возвращал `undefined` и давал случайные 404 на страницах
> кураторов. Откатили в пользу route-level ISR.

### 7.3 Галерея — `src/components/gallery.tsx` + `filter-context.tsx`

- Данные (все ~700 кураторов) приходят с сервера один раз, фильтрация и поиск —
  **на клиенте** (`useMemo`).
- **Фильтры** (`FilterProvider`): 4 группы — `specialization`, `company`,
  `geo`, `collections`. Мультивыбор (Set). Логика: внутри группы — OR, между
  группами — AND.
- **Поиск**: по `name`, `role`, названиям компаний (подстрока, lower-case).
- **Пагинация фида**: батчами по 50 карточек, подгрузка через
  `IntersectionObserver` (rootMargin 1500px). Смена фильтра сбрасывает фид.
- **Раскладка**:
  - Мобайл (`< sm`): 1 карточка в ряд. Планшет (`sm`): 2 в ряд.
  - Десктоп (`lg+`): **ручные шаблоны рядов** — `src/lib/rowTemplates.ts`.
    Фиксированный цикл рукотворных 12-колоночных сеток (small = 3 колонки,
    medium = 4, big = 6), карточки могут занимать 2 строки, быть смещёнными,
    с намеренными пустотами. `chunkIntoRows()` раскладывает видимые карточки
    по циклу шаблонов.
  - `content-visibility: auto` на карточках вне экрана.

### 7.4 Карточка и страница портфолио — логика картинок

Ключевая договорённость. У куратора три «источника изображения»:

1. **`preview_image`** — автоскриншот внешнего сайта. У ~700 импортированных
   кураторов это ссылки на `static.tildacdn.com` (скриншоты, снятые Tilda).
   Хранится как строка URL, задаётся при импорте.
2. **`cover_image`** — «картинка карточки», загружается вручную в админке
   (уходит в S3-бакет `foliodeck-media`).
3. **`external_url`** — ссылка на живой сайт портфолио (для iframe).

**Карточка в галерее** (`curator-card.tsx`):
`cardImage = cover_image || preview_image`. Обложка приоритетнее скриншота.
Если обе пустые/битые — серая заглушка с shimmer.

**Страница портфолио** (`curator-detail.tsx`, компонент `PortfolioView`):
показывает **живой сайт в iframe**, а обложка — только запасной вариант.

- `embeddable === false` → сразу показать `cover_image` (или, если её нет,
  экран «This site can't be shown here» + кнопка Visit).
- `embeddable === true` → доверять iframe.
- `embeddable == null` (легаси) → пробовать iframe; если за ~4 сек он не
  подтвердил реальную кросс-доменную загрузку (заблокированный `X-Frame-Options`
  фрейм «сидит» на читаемом `about:blank`, живой — бросает исключение при
  чтении `contentWindow.location`) → откат на обложку / экран Visit.

Флаг `embeddable` ставится **чекбоксом в форме куратора**: «Сайт не
открывается во встроенном виде — показывать картинку карточки на странице
портфолио (для Тильды и подобных)». Отмечена → `embeddable = false`.

### 7.5 Форма подачи портфолио — `submit-modal.tsx` + `actions/submissions.ts`

Модалка открывается кнопкой «Submit» в шапке.

**Поля**: Name, Email, Telegram or LinkedIn, Specialization (мультиселект из
тегов направлений), Portfolio URL, две обязательные галочки согласия
(на обработку ПДн и на распространение ПДн).

**Валидация** (`submissions/validation.ts`) — и на клиенте (мгновенная), и на
сервере (источник истины): непустые name/contact/specialization, валидный
email по regex, http(s)-URL портфолио, обе галочки.

**Анти-спам** (в `submitPortfolioAction`, без капчи и внешних сервисов):
- **Honeypot**: скрытое поле `company` (спрятано за экраном, `tabindex=-1`).
  Заполнено → `return { ok: true }` молча, в БД ничего не пишется.
- **Лимит по IP**: не больше **3 заявок с одного IP за 60 минут** и не больше
  **20 суммарно за 60 минут**. Считается прямо по `portfolio_submissions`
  (`consent_ip` уже хранится). Превышение → результат `rate_limit` → в модалке
  «Slow down a moment».

**При успешной отправке**: `createSubmission()` пишет строку со статусом `new`,
фиксирует `consent_ip` (первый из `x-forwarded-for`), `consent_user_agent`,
`consent_at`. Затем **best-effort уведомление в Telegram** (если заданы
`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`) — не блокирует отправку. Затем
`revalidatePath("/admin/submissions")`.

### 7.6 Прочее на сайте

- **i18n** (`language-context.tsx`): языки `ru` / `en`, по умолчанию **`en`**,
  выбор хранится в `localStorage` (`foliodeck-language`), переключатель — в
  подвале. Переведены только юридические страницы и подвал; основной интерфейс
  англоязычный.
- **Избранное** (`favorites-context.tsx`): список slug'ов в `localStorage`
  (`foliodeck-favorites`), панель «Favorites» в шапке. Полностью клиентское.
- **Cookie-баннер** (`cookie-banner.tsx`): «только технически необходимые
  cookie, без аналитики и трекинга». Аналитики/трекеров в проекте нет.
- **Subscribe-баннер**: ссылка на телеграм-канал `t.me/design_awesome`.
- **Логотипы компаний** (`company-logo.tsx`): приоритет —
  `tags.logo` (загруженный в админке) → `companyLogoImages.ts` (~60 зашитых
  в код, `/logos/*`) → `companyLogos.ts` (simple-icons: NASA, VK) → серый
  квадрат. Загруженные логотипы прокинуты в фильтр-панель через
  `FilterOptions.companyLogos`.

---

## 8. АДМИНКА (внутренний хост `dizain-tashchit-baza.vercel.app`)

### 8.1 Авторизация — `src/lib/admin-auth.ts` + `actions/auth.ts`

- **Один пароль** `ADMIN_PASSWORD` на всех. Логина/пользователей нет.
- `/admin/login` → `loginAction`: сверяет пароль, при успехе ставит куку.
- **Сессионная кука** `admin_session`: значение =
  `HMAC-SHA256(SESSION_SECRET, "admin")` в hex. httpOnly, `secure` в проде,
  `sameSite=lax`, срок **30 дней**.
- Проверка: `verifySession()` (сравнение `timingSafeEqual`),
  `requireAdminSession()` (redirect на логин при провале) — зовётся в **каждом**
  админском Server Action.
- `proxy.ts` дополнительно гейтит `/admin*` и `/designer*` на уровне middleware.
- Выход — `logoutAction` (удаляет куку).

> Ротация: смена `SESSION_SECRET` в Vercel мгновенно инвалидирует все сессии.

### 8.2 Структура — `AdminShell` (`components/admin/admin-shell.tsx`)

Боковое меню (заголовок «Школа ДТ»):

| Пункт | Путь | Содержимое |
|---|---|---|
| **Портфолио** | `/admin` (+ `/admin/curators/*`) | список и CRUD кураторов |
| **Заявки** | `/admin/submissions` | заявки с публичной формы |
| **Выпускники** | `/designer` (+ `/admin/designers/*`) | база учеников «Дизайн тащит» |
| **Теги выпускников** | `/admin/taxonomy` | справочник таксономии выпускников |
| **Теги портфолио** | `/admin/tags` | теги галереи + логотипы компаний |
| Выйти | — | `logoutAction` |

Layout `admin/(dashboard)/layout.tsx` использует параллельный слот `@modal`
(перехватывающие роуты для форм в модалке — правки открываются поверх списка,
сохраняя его скролл).

### 8.3 Портфолио (кураторы)

**Список** `/admin` (`page.tsx` + `portfolio-list.tsx`):
- Поиск по имени/адресу (`getCuratorsPage({ query, page, pageSize })`).
- Два режима: «По страницам» (по 50) и «Все списком».
- **Drag-and-drop переупорядочивание** (только когда нет активного поиска) →
  `setCuratorPositionAction(id, index)`; плюс кнопки «↑ В начало» / «В конец»
  → `moveCuratorToEdgeAction`. Порядок хранится в `curators.sort_order`
  (новый куратор получает `MIN(sort_order) - 1`, т.е. попадает в начало).
- Колонка статуса картинки: «обложка загружена» / «нужна обложка»
  (`embeddable === false && !cover_image`) / «не проверено» / «открывается».

**Форма** (`curator-form.tsx` в модалке `curator-form-modal.tsx`), поля:
- **Имя** (`name`) — обязательное.
- **Роль** (`role`) — автоподстановка из существующих ролей
  (`getDistinctRoleValues()`, ~56 значений, по популярности), можно вписать новую.
- **Ссылка на портфолио** (`external_url`) — обязательная, тип url.
- **Картинка карточки** (`cover_image`) — загрузка файла или вставка ссылки
  (`ImageUploadField` → `/api/blob-upload` → S3).
- **Чекбокс `notEmbeddable`** → `curators.embeddable`.
- **География** (`geo`) — `<datalist>` из существующих значений.
- **Направление / Компания / Коллекции** — `TagPicker` (мультивыбор тегов,
  можно создать новый тег инлайн).
- **Заметки о портфолио** (`notes`) — textarea, показываются в дропдауне
  «Notes» на странице портфолио.
- Скрытые поля: `slug` (см. ниже), `previewImage` (сохраняет существующий
  скриншот при редактировании; у новых — пусто).

**Slug** генерируется на сервере (`actions/curators.ts` → `parseInput`):
- при создании — `slugify(name)` (транслитерация кириллицы, lower-kebab);
- при редактировании — берётся из скрытого поля (существующий сохраняется);
- если значение не «slug-образное» (например, туда попал полный URL) —
  перегенерируется из имени (самолечение при следующем сохранении);
- коллизия (два одинаковых имени) → в `createCurator` добавляется короткий
  суффикс `-xxxx`.

**Server Actions** (`actions/curators.ts`, все с `requireAdminSession()`):
`createCuratorAction`, `updateCuratorAction`, `deleteCuratorAction`,
`setCuratorPositionAction`, `moveCuratorToEdgeAction`.
Все зовут `revalidatePublicPages(slug)` → `revalidatePath("/", "layout")` +
`revalidatePath("/curator/<slug>")` + `revalidatePath("/admin")`.

**Создание из заявки**: со страницы заявки кнопка «Опубликовать» ведёт на
`/admin/curators/new?name=…&role=…&url=…&from=<id>` (`curator-new-prefill.ts`).
При сохранении такой заявке проставляется статус `published`.

### 8.4 Заявки — `/admin/submissions`

- Список с фильтром по статусу и пагинацией (`getSubmissionsPage`).
  Непросмотренные (`new`) — всегда наверху.
- Статусы (`submissions/status-labels.ts`, UI по-русски):
  `new` Новые · `review` На рассмотрении · `approved` Одобрены ·
  `published` Опубликованы · `rejected` Отклонены · `removed` Удалены.
- Быстрые отметки в списке (`markSubmissionAction`): ✓ = `approved`,
  ✗ = `rejected` (зеркалит реакции ✓/✗ в Telegram). Повторный клик по текущей
  отметке возвращает в `new`. `approved` не понижает уже `published`.
- На странице заявки — смена статуса + админская заметка
  (`setSubmissionStatusAction`).
- Хранится IP и User-Agent на момент согласия (для юридической фиксации).

### 8.5 Теги портфолио — `/admin/tags`

Три раздела: Направление (`specialization`), Компания (`company`),
Коллекции (`collection`).

Для каждого тега: переименование (`renameTagAction`), удаление
(`deleteTagAction`, каскадом снимает связи), счётчик использований.
Добавление нового — форма внизу раздела (`createTag`).

**Логотип компании** (только раздел «Компания»): под каждой компанией поле
«Логотип» (`TagLogoField` → `ImageUploadField` → S3), значение пишется в
`tags.logo` через `setTagLogoAction`. Пусто → используется зашитый логотип
или серый квадрат.

Все действия зовут `revalidatePath("/", "layout")` +
`revalidatePath("/curator/[slug]", "page")` + `revalidatePath("/admin/tags")`.

### 8.6 База выпускников «Дизайн тащит» — `/designer` + `/admin/designers`

Отдельное мини-приложение внутри админки. Доступно на внутреннем хосте по
паролю (на публичном — 404). `designer/layout.tsx` — `force-dynamic` (живые
данные под сессией, не кешируется).

**Модель выпускника** (`designers` + 4 дочерние таблицы):
- Имя, фамилия, обложка (S3), грейд (Junior…Lead, `constants.ts` → `GRADES`),
  опыт в годах, флаг `open_to_work`.
- **Таксономия** — 6 категорий (`platform`, `business_model`, `industry`,
  `interface_type`, `skill`, `company_type`), N:N через `designer_taxonomy`.
- **Программы** — `{ program, cohort, year }` (программы: Карьера / Мобилки /
  Веб, можно вписать свою).
- **Ссылки** — `{ type, url }` (типы: portfolio, cv, linkedin, telegram,
  behance, dribbble, figma).
- **Картинки** — галерея (`designer_images`), сейчас пусто.

**Витрина** `/designer`: сетка карточек с фильтром (таксономия, грейд, опыт,
год, open-to-work), поиск, модалка деталей с кнопкой «скопировать профиль».

**CRUD** `/admin/designers/new` и `/[id]/edit` (`designer-form.tsx`):
`createDesigner` / `updateDesigner` / `deleteDesigner`
(`actions/designers.ts`). Запись дочерних сущностей — полная замена
(`replaceChildren`). При удалении/замене картинок — best-effort удаление
«своих» объектов из S3 (`isOwnedMediaUrl` по `MEDIA_PUBLIC_BASE`).

**Таксономия** `/admin/taxonomy` — CRUD терминов по категориям,
`sort_order` в рамках категории (`actions/taxonomy.ts`).

### 8.7 Загрузка картинок — `/api/blob-upload` + `src/lib/storage.ts`

- Клиент (`image-upload-field.tsx`): даунскейл на canvas до 2400px по длинной
  стороне, ре-энкод в webp (0.9), затем `POST /api/blob-upload` с телом = blob.
- Роут (`runtime = "nodejs"`, `maxDuration = 60`): `verifySession()` →
  `isStorageConfigured()` → проверка content-type (jpeg/png/webp/gif/avif) и
  размера (≤ 8 МБ) → `putObject()`.
- `storage.ts`: S3-клиент (path-style, endpoint `s3.twcstorage.ru`,
  `maxAttempts: 4`, connect timeout 5 с, request timeout 20 с — хоп из США в
  РФ бывает медленным). Ключ объекта: `designers/<имя>-<8hex>.<ext>`. ACL
  `public-read`. Возвращает `{ url: "<MEDIA_PUBLIC_BASE>/<key>" }`.
- Удаление — `deleteObjects(urls)` (только объекты с нашим `MEDIA_PUBLIC_BASE`).

---

## 9. Договорённости и правовые обязательства

- **152-ФЗ / 242-ФЗ (локализация ПДн).** Форма подачи портфолио собирает ПДн
  граждан РФ (имя, email, контакт, ссылки) + IP/User-Agent для фиксации
  согласия. Первичная запись и хранение — в БД **на территории РФ**
  (Timeweb, Москва). Это выполнено миграцией 2026-09-10.
- **Трансграничная передача.** Приложение работает на Vercel (функции в США),
  то есть обработка ПДн происходит за рубежом при чтении из РФ-базы. Требуется
  **уведомление в РКН** о трансграничной передаче и уведомление оператора ПДн.
  Это задача юриста (на 2026-09-10 — не закрыта).
- **Согласия.** Две обязательные галочки в форме: на обработку ПДн и на
  распространение (публикацию) ПДн. Тексты — `src/lib/legal/*.ts`, страницы
  `/privacy-policy`, `/personal-data-consent`, `/data-distribution-consent`.
  Политика прямо утверждает, что «база данных расположена на территории РФ» —
  после миграции это соответствует действительности.
- **Хранение отклонённых заявок** — до 1 года с даты подачи (по политике),
  затем удаление/анонимизация.
- **Vercel Hobby = только некоммерческое использование** по ToS. При появлении
  монетизации — переходить на Pro.
- **DNS без Cloudflare-проксирования** — принципиально: оранжевое облако
  меняет заголовок `Host` и ломает Server Actions в Next 16, а также замедляет
  доступ из РФ.
- **Аналитики и сторонних трекеров нет** — и не добавлять без обновления
  политики.

---

## 10. Деплой и эксплуатация

**Обычный деплой:**
```bash
git push origin main      # Vercel сам соберёт и задеплоит в Production
```

**Изменение переменных окружения:** Vercel → проект `foliodeck-app` →
Environment Variables → отметить Production + Preview → после изменения
сделать Redeploy (или дождаться следующего push).

**Логи:** Vercel → Deployments → конкретный деплой → Logs; или
`npx vercel logs <deployment-url>`.

**Мониторинг БД:** Timeweb → `foliodeck-db` → Дашборд / Логи. Проверка
подключений: `SELECT count(*) FROM pg_stat_activity`.

**Бэкапы БД:** Timeweb делает физические бэкапы раз в день (услуга включена).
Восстановление — из панели Timeweb (вкладка «Бэкапы»).

**Скрипты миграции** (одноразовые, уже отработали, оставлены для истории):
- `scripts/migrate-to-ru.mjs` — схема + перенос строк Neon → Timeweb + сброс
  последовательностей + сверка. Идемпотентен.
- `scripts/migrate-images-to-ru.mjs` — перенос картинок Vercel Blob → S3 +
  переписывание URL в БД. Идемпотентен (`--dry` для проверки).
Оба читают `DATABASE_URL` (источник) и `DATABASE_URL_RU` / `S3_*` (цель) из
`.env.local`.

---

## 11. Восстановление с нуля (runbook)

Если всё потеряно, но есть репозиторий и **бэкап БД** (+ картинки в бакете):

1. **БД.** Создать Managed PostgreSQL 17 в Timeweb (или любом PostgreSQL 14+,
   лучше в РФ). Восстановить из бэкапа Timeweb, либо накатить схему из
   `scripts/migrate-to-ru.mjs` (переменная `DDL`) и восстановить данные из
   дампа. Поднять `max_connections` до ~200. Включить публичный доступ.
   Записать доменную строку подключения.
2. **Хранилище.** Создать публичный S3-бакет (Timeweb Object Storage или
   аналог). Восстановить содержимое `foliodeck-media` из бэкапа/копии.
   Создать сервисный аккаунт со статическими ключами. Записать endpoint,
   регион, бакет, ключи, публичный базовый URL.
   - Если картинки утеряны: обложки кураторов/выпускников придётся
     перезагрузить вручную; скриншоты-превью (`preview_image`) ведут на
     `static.tildacdn.com` и не зависят от нашего хранилища.
3. **Хостинг.** Импортировать репозиторий `mariyork13/foliodeck-app` в новый
   проект Vercel. Framework — Next.js, ничего дополнительно настраивать не надо.
4. **Переменные окружения** (Production + Preview) — по таблице §5. Минимально
   необходимые: `DATABASE_URL_RU`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `MEDIA_PUBLIC_BASE`,
   `DESIGNER_HOST`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `SITE_ORIGIN`.
5. **Внутренний хост.** Добавить в проект домен для админки (например,
   `dizain-tashchit-baza.vercel.app` или `base.foliodeck.pro`) и указать его
   в `DESIGNER_HOST`. Проверить: на этом хосте `/admin/login` открывается, на
   публичном — `/admin` отдаёт 404.
6. **Домен.** Добавить `foliodeck.pro` и `www.foliodeck.pro` в проект Vercel.
   У reg.ru в DNS-зоне: `A @ → <IP Vercel>`, `A www → <IP Vercel>` (Vercel
   покажет актуальный IP). `www` — как 307-редирект на apex. Дождаться
   выпуска SSL. **Без Cloudflare-проксирования.**
7. **Деплой** — `git push origin main`, дождаться Production.
8. **Проверка:** `foliodeck.pro` открывается, картинки грузятся с нового
   хранилища, `/admin` на публичном хосте → 404, вход в админку по паролю
   работает, форма подачи отправляется и заявка появляется в админке.
9. **Юридическое:** актуализировать уведомление РКН (новый поставщик/место
   хранения при необходимости).

---

## 12. Известные ограничения и что доделать

- [ ] **РКН**: уведомление оператора ПДн + трансграничная передача (юрист).
- [ ] Отклонить тестовые заявки в админке (email `migration-test@example.com`).
- [ ] Через ~2 недели после 2026-09-10: удалить проект **Neon** и стор
      **Vercel Blob**; отключить интеграцию Vercel–Neon и её переменные;
      вынести секреты из `.env.local` (лежит в синхронизируемой папке iCloud).
- [ ] Поменять 307-редирект `www` на 308 (Permanent) — мелочь для SEO
      (`www.foliodeck.pro` уже добавлен в Vercel и редиректит на apex, проверено).
- [ ] Функции Vercel в регионе `iad1` (США) — далеко от БД (Москва) и
      хранилища (СПб). Хоп через океан. Можно закрепить регион `fra1` в
      `vercel.json` (`{ "regions": ["fra1"] }`) — ближе к РФ. Не обязательно,
      т.к. публичные страницы кешируются.
- [ ] Транзакций в слое записи нет (designers/curators — DELETE+INSERT детей
      без `BEGIN`). При сбое посреди операции возможна частичная запись.
      Для текущего объёма и одного администратора приемлемо.
- [ ] `curator_images` — легаси-таблица (галерея картинок куратора), почти
      пустая, в UI не используется.
- [ ] Единый пароль админки без 2FA. Ротация — сменой `ADMIN_PASSWORD` и
      `SESSION_SECRET` в Vercel.
