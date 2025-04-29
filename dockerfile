FROM node:18

WORKDIR /app

# Copia solo archivos de dependencias
COPY package.json ./

# Instala TODAS las dependencias
RUN npm install

# Ahora sí copia TODO tu proyecto, excepto node_modules gracias al .dockerignore
#COPY . .

EXPOSE 3000

#CMD ["node", "wait-for-postgres.js"]
CMD ["npm", "run","dev"]