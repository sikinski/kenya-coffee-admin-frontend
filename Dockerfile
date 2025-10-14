# 1. Базовый образ
FROM node:20

# 2. Рабочая директория
WORKDIR /admin_frontend

# # 3. Установим pnpm глобально
# RUN npm install -g pnpm

# 4. Сначала копируем только package.json и package-lock.json / pnpm-lock.yaml
COPY package.json package-lock.json* ./

# 5. Устанавливаем зависимости
RUN npm install

# 6. Копируем остальной код
COPY . .

# 7. Сборка Nuxt
RUN npm run build

# 8. Порт приложения
EXPOSE 3001

# Настраиваем переменные окружения
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

# Запускаем сервер
CMD ["node", ".output/server/index.mjs"]