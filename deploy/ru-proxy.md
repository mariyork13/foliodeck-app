# Доступ к foliodeck.pro с мобильного интернета

**Проблема.** `foliodeck.pro` отдаётся напрямую с Vercel (США). Российские
мобильные операторы режут диапазоны Vercel — с сотовых данных сайт не
открывается, только по Wi-Fi или через VPN.

**Решение.** Маленький российский VPS с Caddy стоит «перед» доменом и
проксирует запросы на Vercel. Мобильный трафик приходит на чистый российский
IP; дальше VPS → Vercel — это связь между дата-центрами, её не режут.

```
Мобильный интернет РФ ──► VPS (РФ, Caddy) ──► foliodeck-app.vercel.app ──► приложение
```

Приложение, база (Timeweb) и картинки (Timeweb S3) не трогаются. Конфиг —
[`deploy/Caddyfile`](./Caddyfile).

---

## Шаг 1. Завести VPS

**Timeweb Cloud** (у тебя там уже аккаунт) → **Облачные серверы** → **Создать**:

| Параметр | Значение |
|---|---|
| ОС | Ubuntu 24.04 |
| Конфигурация | самая младшая: 1 CPU / 1 ГБ RAM / 15 ГБ NVMe (~230 ₽/мес) |
| Регион | любой российский (Москва / СПб) |
| Публичный IPv4 | включить (обычно уже включён) |
| SSH-ключ | добавить свой, либо задать root-пароль |

Запиши **публичный IPv4-адрес** сервера — он понадобится дважды.

Аналоги, если не Timeweb: Beget, Selectel, RuVDS — подойдёт любой самый
дешёвый тариф.

---

## Шаг 2. Установить Caddy

Зайти на сервер (`ssh root@IP_СЕРВЕРА`) и выполнить:

```bash
apt update && apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

Caddy сразу поднимается как systemd-сервис и стартует при загрузке.

---

## Шаг 3. Положить конфиг

Скопировать `deploy/Caddyfile` из репозитория в `/etc/caddy/Caddyfile` на
сервере (через `scp`, либо просто `nano /etc/caddy/Caddyfile` и вставить
содержимое). Затем:

```bash
caddy validate --config /etc/caddy/Caddyfile   # проверка синтаксиса
systemctl reload caddy
```

Порты 80 и 443 должны быть открыты (у Timeweb по умолчанию открыты; если есть
файрвол — разрешить входящие TCP 80 и 443).

---

## Шаг 4. Переключить DNS

DNS домена `foliodeck.pro` управляется в панели **reg.ru**.

| Запись | Было | Стало |
|---|---|---|
| `foliodeck.pro` A | `216.198.79.1` (Vercel) | **IP твоего VPS** |
| `www.foliodeck.pro` A (или CNAME) | Vercel | **IP твоего VPS** |

Если можно — сначала поставь TTL записи поменьше (300 сек), чтобы откат был
быстрым.

Домен в проекте Vercel **оставь как есть** — Vercel в дашборде покажет
«DNS не настроен», это косметика: он всё равно обслуживает
`foliodeck-app.vercel.app`, куда мы и проксируем. Так можно за минуту
откатиться, вернув A-запись на `216.198.79.1`.

---

## Шаг 5. Проверить

Подождать 5–30 минут (распространение DNS). Caddy сам выпустит
Let's Encrypt сертификаты на `foliodeck.pro` и `www.foliodeck.pro` при первом
запросе.

```bash
# с любой машины
curl -sI https://foliodeck.pro | head -5          # HTTP/2 200
curl -s https://foliodeck.pro | grep -o '<title>[^<]*'   # <title>Foliodeck …

# на сервере — логи Caddy
journalctl -u caddy -f
```

Главная проверка — **открыть `foliodeck.pro` с телефона по мобильному
интернету** (Wi-Fi выключить, VPN выключить).

---

## Обслуживание

- Caddy обновляет сертификаты сам, раз в ~60 дней.
- Обновления ОС: `apt update && apt upgrade -y` раз в пару месяцев.
- Если VPS упадёт — сайт недоступен до перезагрузки сервера. Для одного
  небольшого проекта это приемлемо; при желании позже можно добавить второй
  VPS и две A-записи.
- Смена деплоя на Vercel никак не влияет на прокси — он всегда указывает на
  стабильный `foliodeck-app.vercel.app` (текущий production).

## Откат

Вернуть A-запись `foliodeck.pro` на `216.198.79.1` в reg.ru. Через несколько
минут трафик снова идёт напрямую на Vercel.
