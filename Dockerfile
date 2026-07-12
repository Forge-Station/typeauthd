FROM node:18-alpine AS build  
WORKDIR /app  

COPY package*.json ./  

RUN npm ci  

COPY . .  

RUN npm run build  

FROM node:18-slim
WORKDIR /app

COPY --from=build /app /app

# sqlite3 тянет prebuilt-бинарь, слинкованный под более новую glibc, чем в этом
# образе (node:18-slim = glibc 2.36) → при загрузке падает "GLIBC_2.38 not found".
# Собираем его из исходников под glibc текущего образа. Тулчейн ставим только на
# время сборки и вычищаем, чтобы не раздувать финальный слой.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && npm_config_build_from_source=true npm ci --omit=dev \
 && apt-get purge -y python3 make g++ \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

CMD ["node", "dist/index.js"]
