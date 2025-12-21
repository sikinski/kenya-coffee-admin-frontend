# Пошаговая инструкция по развертыванию Kenya Coffee на сервере

## Предварительные требования

- Сервер с Ubuntu/Debian (рекомендуется Ubuntu 20.04+)
- **DNS настройки (ВАЖНО!):**
  - `kenya-coffee.ru` → IP вашего сервера (A-запись)
  - `www.kenya-coffee.ru` → IP вашего сервера (A-запись) или CNAME на kenya-coffee.ru
  - `admin.kenya-coffee.ru` → IP вашего сервера (A-запись)
- Доступ по SSH к серверу
- Права sudo на сервере

---

## ШАГ 1: Подготовка сервера

### 1.1. Подключитесь к серверу по SSH
```bash
ssh root@kenya-coffee.ru
# или
ssh ваш_пользователь@kenya-coffee.ru
```

### 1.2. Обновите систему
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3. Установите необходимые пакеты
```bash
sudo apt install -y curl git nginx certbot python3-certbot-nginx apache2-utils
```

### 1.4. Установите Docker и Docker Compose
```bash
# Установка Docker (включает Docker Compose как плагин)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Перезайдите в систему или выполните:
newgrp docker
```

**Примечание:** Современные версии Docker включают Docker Compose как встроенный плагин. После установки вы сможете использовать команду `docker compose` (с пробелом) вместо старой `docker-compose` (с дефисом).

### 1.5. Проверьте установку
```bash
docker --version
docker compose version
```

Обе команды должны работать. Если `docker compose version` не работает, установите плагин отдельно:
```bash
# Только если docker compose не работает
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

---

## ШАГ 2: Создание структуры директорий

### 2.1. Создайте основную директорию проекта
```bash
sudo mkdir -p /opt/kenya-coffee
cd /opt/kenya-coffee
```

### 2.2. Создайте директории для каждого компонента
```bash
sudo mkdir -p frontend admin backend nginx
```

---

## ШАГ 3: Настройка Git для автоматической аутентификации

Перед клонированием репозиториев настройте Git, чтобы не вводить логин и пароль каждый раз.

### Вариант 1: Использование SSH ключей (РЕКОМЕНДУЕТСЯ)

#### 3.1.1. Создайте SSH ключ (если еще нет)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Нажмите Enter для всех вопросов (или укажите путь к файлу)
```

#### 3.1.2. Покажите публичный ключ
```bash
cat ~/.ssh/id_ed25519.pub
```

#### 3.1.3. Добавьте ключ в GitHub
1. Скопируйте весь вывод команды выше
2. Зайдите на GitHub.com → Settings → SSH and GPG keys → New SSH key
3. Вставьте ключ и сохраните

#### 3.1.4. Проверьте подключение
```bash
ssh -T git@github.com
# Должно вывести: "Hi sikinski! You've successfully authenticated..."
```

#### 3.1.5. Измените URL репозиториев на SSH (после клонирования)
После клонирования (шаг 3.2-3.4) выполните в каждом репозитории:
```bash
cd /opt/kenya-coffee/frontend
sudo git remote set-url origin git@github.com:sikinski/kenya-coffee-frontend.git

cd /opt/kenya-coffee/admin
sudo git remote set-url origin git@github.com:sikinski/kenya-coffee-admin-frontend.git

cd /opt/kenya-coffee/backend
sudo git remote set-url origin git@github.com:sikinski/kenya-coffee-backend.git
```
---

## ШАГ 4: Клонирование репозиториев

### 4.1. Клонируйте фронтенд (порт 3000)
```bash
cd /opt/kenya-coffee/frontend
sudo git clone https://github.com/sikinski/kenya-coffee-frontend.git .
```

### 4.2. Клонируйте админку (порт 3001)
```bash
cd /opt/kenya-coffee/admin
sudo git clone https://github.com/sikinski/kenya-coffee-admin-frontend.git .
```

### 4.3. Клонируйте бэкенд
```bash
cd /opt/kenya-coffee/backend
sudo git clone https://github.com/sikinski/kenya-coffee-backend.git .
```

**Если используете SSH (Вариант 1 из шага 3):**
После клонирования измените URL на SSH (команды в шаге 3.1.5).

---

## ШАГ 5: Настройка фронтенда (порт 3000)

### 4.1. Создайте Dockerfile для фронтенда
```bash
cd /opt/kenya-coffee/frontend
sudo nano Dockerfile
```

Вставьте следующее содержимое:
```dockerfile
FROM node:20

WORKDIR /frontend

COPY package.json package-lock.json* ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN rm -rf .nuxt .output node_modules/.vite

RUN pnpm run build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

Сохраните (Ctrl+O, Enter, Ctrl+X)

### 4.2. Создайте docker-compose.yml для фронтенда
```bash
sudo nano docker-compose.yml
```

Вставьте:
```yaml
version: "3.8"

services:
  frontend:
    container_name: kenya_coffee_frontend
    build: .
    ports:
      - "3000:3000"
    restart: always
    environment:
      NODE_ENV: production
      NUXT_LOG_LEVEL: error
      NUXT_HOST: 0.0.0.0
      NUXT_PORT: 3000
      BACKEND_ADDRESS: https://kenya-coffee.ru/backend
      WS_ADDRESS: wss://kenya-coffee.ru/backend
```

Сохраните и выйдите.

---

## ШАГ 6: Настройка админки (порт 3001)

### 5.1. Проверьте Dockerfile админки
```bash
cd /opt/kenya-coffee/admin
cat Dockerfile
```

Если нужно, исправьте порт в Dockerfile на 3000 (внутри контейнера):
```bash
sudo nano Dockerfile
```

Убедитесь, что:
- `ENV NUXT_PORT=3000` (внутри контейнера)
- `EXPOSE 3000`

### 5.2. Обновите docker-compose.yml админки
```bash
sudo nano docker-compose.yml
```

Измените на:
```yaml
version: "3.8"

services:
  admin_frontend:
    container_name: kenya_coffee_admin
    build: .
    ports:
      - "3001:3000"
    restart: always
    environment:
      NODE_ENV: production
      NUXT_LOG_LEVEL: error
      NUXT_HOST: 0.0.0.0
      NUXT_PORT: 3000
      BACKEND_ADDRESS: https://kenya-coffee.ru/backend
      WS_ADDRESS: wss://kenya-coffee.ru/backend
```

Сохраните.

---

## ШАГ 7: Настройка бэкенда

### 6.1. Проверьте структуру бэкенда
```bash
cd /opt/kenya-coffee/backend
ls -la
```

### 6.2. Создайте или обновите Dockerfile для бэкенда
```bash
sudo nano Dockerfile
```

Пример содержимого (адаптируйте под ваш проект):
```dockerfile
FROM node:20

WORKDIR /backend

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# Если используется Prisma
RUN npx prisma generate

EXPOSE 3002

CMD ["npm", "start"]
```

### 6.3. Создайте docker-compose.yml для бэкенда
```bash
sudo nano docker-compose.yml
```

Вставьте:
```yaml
version: "3.8"

services:
  backend:
    container_name: kenya_coffee_backend
    build: .
    ports:
      - "3002:3002"
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      # Добавьте другие переменные окружения
    volumes:
      - ./prisma:/backend/prisma
      # Если нужны другие volumes
```

**ВАЖНО:** Вам нужно будет настроить переменные окружения для базы данных. Создайте файл `.env`:
```bash
sudo nano .env
```

Добавьте туда ваши переменные (DATABASE_URL и другие).

---

## ШАГ 8: Настройка Nginx

### 7.1. Создайте файл конфигурации Nginx
```bash
sudo nano /etc/nginx/sites-available/kenya-coffee
```

Вставьте следующую конфигурацию:
```nginx
# Редирект с HTTP на HTTPS для основного сайта
server {
    listen 80;
    server_name kenya-coffee.ru www.kenya-coffee.ru;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Редирект с HTTP на HTTPS для админки
server {
    listen 80;
    server_name admin.kenya-coffee.ru;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Основной сайт (HTTPS) - kenya-coffee.ru
server {
    listen 443 ssl http2;
    server_name kenya-coffee.ru www.kenya-coffee.ru;

    # SSL сертификаты (будут установлены certbot)
    ssl_certificate /etc/letsencrypt/live/kenya-coffee.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kenya-coffee.ru/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Логи
    access_log /var/log/nginx/kenya-coffee-access.log;
    error_log /var/log/nginx/kenya-coffee-error.log;

    # Проксирование бэкенда на /backend/
    location /backend/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Для CORS (если нужно)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Проксирование основного фронтенда
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Админка (HTTPS) - admin.kenya-coffee.ru
server {
    listen 443 ssl http2;
    server_name admin.kenya-coffee.ru;

    # SSL сертификаты (будут установлены certbot)
    ssl_certificate /etc/letsencrypt/live/admin.kenya-coffee.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.kenya-coffee.ru/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Логи
    access_log /var/log/nginx/admin-kenya-coffee-access.log;
    error_log /var/log/nginx/admin-kenya-coffee-error.log;

    # Basic Auth для админки
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Проксирование админки
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Сохраните и выйдите.

### 7.2. Создайте символическую ссылку
```bash
sudo ln -s /etc/nginx/sites-available/kenya-coffee /etc/nginx/sites-enabled/
```

### 7.3. Удалите дефолтную конфигурацию (если есть)
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 7.4. Проверьте конфигурацию Nginx
```bash
sudo nginx -t
```

Если есть ошибки, исправьте их.

---

## ШАГ 9: Создание пароля для админки

### 8.1. Создайте файл с паролем
```bash
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

Вам будет предложено ввести пароль дважды. Запомните его!

**Для добавления дополнительных пользователей (без флага -c):**
```bash
sudo htpasswd /etc/nginx/.htpasswd другой_пользователь
```

---

## ШАГ 10: Получение SSL сертификата

### 9.1. Временно запустите Nginx без SSL
Сначала закомментируйте SSL строки в конфигурации:
```bash
sudo nano /etc/nginx/sites-available/kenya-coffee
```

Временно измените блок HTTPS на:
```nginx
server {
    listen 443 ssl http2;
    server_name kenya-coffee.ru www.kenya-coffee.ru;

    # Временно закомментировано для получения сертификата
    # ssl_certificate /etc/letsencrypt/live/kenya-coffee.ru/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/kenya-coffee.ru/privkey.pem;
    
    # ... остальное
}
```

Или используйте временный самоподписанный сертификат:
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

И временно укажите эти пути в конфигурации.

### 9.2. Запустите Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 9.3. Получите SSL сертификаты через Certbot

**ВАЖНО:** Перед получением сертификатов убедитесь, что DNS записи настроены:
- `kenya-coffee.ru` → IP сервера (A-запись)
- `www.kenya-coffee.ru` → IP сервера (A-запись) или CNAME на kenya-coffee.ru
- `admin.kenya-coffee.ru` → IP сервера (A-запись)

Проверьте DNS записи (замените `YOUR_SERVER_IP` на IP вашего сервера):
```bash
dig kenya-coffee.ru +short
dig www.kenya-coffee.ru +short
dig admin.kenya-coffee.ru +short
```

Все должны возвращать IP вашего сервера. Если DNS еще не настроены, подождите несколько минут после настройки (может потребоваться до 24 часов, но обычно работает за 5-15 минут).

Получите сертификат для основного домена:
```bash
sudo certbot --nginx -d kenya-coffee.ru -d www.kenya-coffee.ru
```

Получите сертификат для админки:
```bash
sudo certbot --nginx -d admin.kenya-coffee.ru
```

Certbot автоматически обновит конфигурацию Nginx и установит SSL для обоих доменов.

### 9.4. Проверьте автообновление сертификата
```bash
sudo certbot renew --dry-run
```

---

## ШАГ 11: Настройка бэкенда для работы под /backend/

### 10.1. Вам нужно настроить Fastify для работы под префиксом /backend/

Проверьте файл с настройкой сервера в бэкенде (обычно это `server.js` или `index.js`). 

**ВАЖНО:** В Nginx мы используем `proxy_pass http://localhost:3002/;` (с завершающим слэшем) - это означает, что Nginx **убирает** `/backend/` из пути перед отправкой на бэкенд.

**Пример работы:**
- Пользователь запрашивает: `https://kenya-coffee.ru/backend/contacts`
- Nginx получает: `/backend/contacts`
- Nginx отправляет на бэкенд: `/contacts` (убрал `/backend/`)
- Fastify должен обработать: `/contacts` (БЕЗ префикса `/backend`)

**Поэтому в Fastify роуты должны быть БЕЗ префикса `/backend`:**

```javascript
// Статические файлы БЕЗ префикса /backend
await fastify.register(staticFiles, {
    root: join(__dirname, 'uploads'),
    prefix: '/uploads/'  // НЕ /backend/uploads/
});

// Роуты БЕЗ префикса /backend
await fastify.register(async function (fastify) {
    fastify.register(authRoutes);
    fastify.register(contactsRoutes);
    // ... остальные роуты
}); // БЕЗ { prefix: '/backend' }
```

Если у вас уже есть `prefix: '/backend'` в коде, **уберите его** - Nginx уже обрабатывает префикс.

---

## ШАГ 12: Сборка и запуск всех сервисов

### 11.1. Соберите и запустите фронтенд
```bash
cd /opt/kenya-coffee/frontend
sudo docker compose build
sudo docker compose up -d
```

### 11.2. Соберите и запустите админку
```bash
cd /opt/kenya-coffee/admin
sudo docker compose build
sudo docker compose up -d
```

### 11.3. Соберите и запустите бэкенд
```bash
cd /opt/kenya-coffee/backend
sudo docker compose build
sudo docker compose up -d
```

### 11.4. Перезапустите Nginx
```bash
sudo systemctl restart nginx
```

---

## ШАГ 13: Проверка работы

### 12.1. Проверьте статус контейнеров
```bash
sudo docker ps
```

Все три контейнера должны быть запущены.

### 12.2. Проверьте логи
```bash
# Фронтенд
sudo docker logs kenya_coffee_frontend

# Админка
sudo docker logs kenya_coffee_admin

# Бэкенд
sudo docker logs kenya_coffee_backend

# Nginx
sudo tail -f /var/log/nginx/kenya-coffee-access.log
```

### 12.3. Проверьте доступность

- **Фронтенд:** https://kenya-coffee.ru
- **Админка:** https://admin.kenya-coffee.ru (потребуется пароль)
- **Бэкенд API:** https://kenya-coffee.ru/backend/contacts

---

## ШАГ 14: Настройка автозапуска (опционально)

### 13.1. Создайте systemd сервисы для автозапуска Docker Compose

Создайте файл для фронтенда:
```bash
sudo nano /etc/systemd/system/kenya-coffee-frontend.service
```

```ini
[Unit]
Description=Kenya Coffee Frontend
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/kenya-coffee/frontend
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Аналогично для админки и бэкенда.

### 13.2. Включите автозапуск
```bash
sudo systemctl enable kenya-coffee-frontend.service
sudo systemctl enable kenya-coffee-admin.service
sudo systemctl enable kenya-coffee-backend.service
```

---

## Полезные команды для управления

### Просмотр логов
```bash
# Все контейнеры
sudo docker compose -f /opt/kenya-coffee/frontend/docker-compose.yml logs -f
sudo docker compose -f /opt/kenya-coffee/admin/docker-compose.yml logs -f
sudo docker compose -f /opt/kenya-coffee/backend/docker-compose.yml logs -f
```

### Перезапуск сервисов
```bash
cd /opt/kenya-coffee/frontend && sudo docker compose restart
cd /opt/kenya-coffee/admin && sudo docker compose restart
cd /opt/kenya-coffee/backend && sudo docker compose restart
sudo systemctl restart nginx
```

### Обновление кода
```bash
# Фронтенд
cd /opt/kenya-coffee/frontend
sudo git pull
sudo docker compose build
sudo docker compose up -d

# Админка
cd /opt/kenya-coffee/admin
sudo git pull
sudo docker compose build
sudo docker compose up -d

# Бэкенд
cd /opt/kenya-coffee/backend
sudo git pull
sudo docker compose build
sudo docker compose up -d
```

---

## Решение проблем

### Проблема: Контейнеры не запускаются
```bash
# Проверьте логи
sudo docker logs <имя_контейнера>

# Проверьте, не заняты ли порты
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002
```

### Проблема: Nginx возвращает 502 Bad Gateway
- Проверьте, что контейнеры запущены: `sudo docker ps`
- Проверьте, что порты правильные в docker-compose.yml
- Проверьте логи Nginx: `sudo tail -f /var/log/nginx/kenya-coffee-error.log`

### Проблема: SSL не работает
- Проверьте, что домен указывает на сервер: `dig kenya-coffee.ru`
- Проверьте конфигурацию: `sudo nginx -t`
- Проверьте сертификаты: `sudo certbot certificates`

### Проблема: Бэкенд не доступен по /backend/
- Проверьте конфигурацию Nginx (location /backend/)
- Проверьте, что бэкенд слушает правильный порт
- Проверьте логи бэкенда на наличие ошибок

---

## Важные замечания

1. **Безопасность:** Убедитесь, что файлы `.env` с паролями не попали в git
2. **База данных:** Настройте правильный DATABASE_URL для Prisma
3. **Файрвол:** Откройте порты 80 и 443:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Резервное копирование:** Настройте регулярное резервное копирование базы данных

---

Готово! Ваш сайт должен быть доступен по адресу https://kenya-coffee.ru

