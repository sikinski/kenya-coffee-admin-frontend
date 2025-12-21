# Быстрые команды для управления сервером

## Основные команды

### Проверка статуса
```bash
# Проверить запущенные контейнеры
sudo docker ps

# Проверить все контейнеры (включая остановленные)
sudo docker ps -a

# Проверить статус Nginx
sudo systemctl status nginx
```

### Логи
```bash
# Фронтенд
sudo docker logs -f kenya_coffee_frontend

# Админка
sudo docker logs -f kenya_coffee_admin

# Бэкенд
sudo docker logs -f kenya_coffee_backend

# Nginx
sudo tail -f /var/log/nginx/kenya-coffee-access.log
sudo tail -f /var/log/nginx/kenya-coffee-error.log
```

### Перезапуск сервисов
```bash
# Фронтенд
cd /opt/kenya-coffee/frontend && sudo docker compose restart

# Админка
cd /opt/kenya-coffee/admin && sudo docker compose restart

# Бэкенд
cd /opt/kenya-coffee/backend && sudo docker compose restart

# Nginx
sudo systemctl restart nginx
```

### Остановка/Запуск
```bash
# Остановить все
cd /opt/kenya-coffee/frontend && sudo docker compose down
cd /opt/kenya-coffee/admin && sudo docker compose down
cd /opt/kenya-coffee/backend && sudo docker compose down

# Запустить все
cd /opt/kenya-coffee/frontend && sudo docker compose up -d
cd /opt/kenya-coffee/admin && sudo docker compose up -d
cd /opt/kenya-coffee/backend && sudo docker compose up -d
```

### Обновление кода
```bash
# Фронтенд
cd /opt/kenya-coffee/frontend
sudo git pull
sudo docker compose build --no-cache
sudo docker compose up -d

# Админка
cd /opt/kenya-coffee/admin
sudo git pull
sudo docker compose build --no-cache
sudo docker compose up -d

# Бэкенд
cd /opt/kenya-coffee/backend
sudo git pull
sudo docker compose build --no-cache
sudo docker compose up -d
```

### Управление паролем админки
```bash
# Добавить пользователя
sudo htpasswd /etc/nginx/.htpasswd имя_пользователя

# Изменить пароль существующего пользователя
sudo htpasswd /etc/nginx/.htpasswd имя_пользователя

# Удалить пользователя
sudo htpasswd -D /etc/nginx/.htpasswd имя_пользователя

# Просмотреть список пользователей
cat /etc/nginx/.htpasswd
```

### SSL сертификаты
```bash
# Проверить статус сертификатов
sudo certbot certificates

# Обновить сертификаты вручную
sudo certbot renew

# Тест обновления
sudo certbot renew --dry-run
```

### Проверка портов
```bash
# Проверить, какие порты заняты
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3002
```

### Проверка конфигурации Nginx
```bash
# Проверить синтаксис
sudo nginx -t

# Перезагрузить конфигурацию
sudo nginx -s reload
```

### Очистка Docker
```bash
# Удалить неиспользуемые образы
sudo docker image prune -a

# Удалить остановленные контейнеры
sudo docker container prune

# Полная очистка (осторожно!)
sudo docker system prune -a
```

