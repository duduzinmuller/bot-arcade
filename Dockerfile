
FROM node:22-slim

WORKDIR /app

# Build arguments para variáveis de ambiente
ARG DISCORD_TOKEN
ARG CLIENT_ID
ARG DATABASE_PATH
ARG WEB_PORT
ARG WEB_SECRET
ARG XP_PER_MESSAGE
ARG XP_COOLDOWN
ARG LEVEL_MULTIPLIER

# Definir variáveis de ambiente
ENV DISCORD_TOKEN=$DISCORD_TOKEN
ENV CLIENT_ID=$CLIENT_ID
ENV DATABASE_PATH=$DATABASE_PATH
ENV WEB_PORT=$WEB_PORT
ENV WEB_SECRET=$WEB_SECRET
ENV XP_PER_MESSAGE=$XP_PER_MESSAGE
ENV XP_COOLDOWN=$XP_COOLDOWN
ENV LEVEL_MULTIPLIER=$LEVEL_MULTIPLIER

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p ./data

EXPOSE 3000

CMD ["npm", "start"] 