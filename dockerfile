FROM node:18

#dependencias de sharp
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

# Copia solo archivos de dependencias
COPY package.json ./

# Instala TODAS las dependencias
RUN npm install

# Ahora sí copia TODO tu proyecto, excepto node_modules gracias al .dockerignore
COPY . .

EXPOSE 3000

#CMD ["node", "wait-for-postgres.js"]
CMD ["npm", "run","dev"]