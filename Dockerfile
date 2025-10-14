# 1. Базовый образ
FROM node:20

# 2. Рабочая директория
WORKDIR /admin_frontend

# 3. Установим pnpm 
RUN npx pnpm install

# Чистим старые node_modules и lock-файлы (по желанию)
RUN rm -rf .nuxt .output node_modules/.vite
RUN rm -rf node_modules pnpm-lock.yaml* package-lock.json*

# 4. Сначала копируем только package.json и package-lock.json / pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 5. Устанавливаем зависимости
RUN pnpm install

# 6. Копируем остальной код
COPY . .

# 7. Сборка Nuxt
RUN pnpm run build

# 8. Порт приложения
EXPOSE 3001

# Настраиваем переменные окружения
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

# Запускаем сервер
CMD ["node", ".output/server/index.mjs"]