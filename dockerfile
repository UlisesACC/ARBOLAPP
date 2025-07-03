FROM node:18

RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run","dev"]
