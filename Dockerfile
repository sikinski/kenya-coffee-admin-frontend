FROM node:20

WORKDIR /admin_frontend

# # # Установим конкретную версию pnpm
# RUN npm install -g pnpm
RUN npm install

# Копируем lock-файлы
COPY ./package.json ./
# COPY ./pnpm-lock.yaml ./

# Устанавливаем зависимости строго по lock-файлу
# RUN pnpm install
RUN npm install

# Копируем остальные файлы
COPY . .

# Собираем Nuxt-приложение
RUN npm run build

# Открываем порт
EXPOSE 3001

# Настраиваем переменные окружения
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

# Запускаем сервер с увеличенным лимитом памяти
CMD ["node", ".output/server/index.mjs"]
