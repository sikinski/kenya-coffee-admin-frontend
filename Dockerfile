# 1. Базовый образ
FROM node:20

# 2. Рабочая директория
WORKDIR /admin_frontend

# 3. Копируем только package.json и lock-файлы для установки зависимостей
COPY package.json pnpm-lock.yaml* ./

# 4. Устанавливаем pnpm глобально
RUN npm install -g pnpm

# 5. Устанавливаем зависимости
RUN pnpm install

# 6. Копируем весь остальной код проекта
COPY . .

# 7. Чистим возможные кеши перед билдом (по желанию)
RUN rm -rf .nuxt .output node_modules/.vite

# 8. Собираем Nuxt
RUN pnpm run build

# 9. Настройки окружения
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 10. Открываем порт
EXPOSE 3000

# 11. Команда запуска
CMD ["node", ".output/server/index.mjs"]
