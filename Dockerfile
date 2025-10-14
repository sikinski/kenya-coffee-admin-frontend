# 1. Базовый образ
FROM node:20

# 2. Рабочая директория
WORKDIR /admin_frontend


# 3. Сначала копируем только package.json и package-lock.json / pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 4. Устанавливаем зависимости
RUN pnpm install

# 5. Копируем остальной код
COPY . .

# 6. Сборка Nuxt
RUN pnpm run build

# 7. Порт приложения
EXPOSE 3001

# Настраиваем переменные окружения
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

# Запускаем сервер
CMD ["node", ".output/server/index.mjs"]