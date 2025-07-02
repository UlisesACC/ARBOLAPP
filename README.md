# ArbolApp
Para inicalizar el servidor se nesecita el siguiente comando
```bash
docker-compose up --build
```
para salir solo poner control c 2 veces
para tirar el server desde cero
```bash
docker-compose down -v
```
donde tambien reinicia la informacion de la base de datos desde cero
otra opcion
```bash
docker compose down --volumes --remove-orphans
docker system prune -af
docker compose up --build
```
## Para subir cambios
Se configuro para github y gitlab
si se quiere subir a ambos repos se creo un alias
```bash
git config alias.pushall '!git push origin HEAD && git push gitlab HEAD'
```
y solo ejecutar 
```bash
git pushall
```
Para ver si esta en repo remoto poner
```bash
git remote -v
```
Para agregar un repo de gitlab es poner
```bash
git remote add gitlab https://gitlab.com/first_proyect4/arbolapp.git
```
Para subir los cambios es con
```bash
git push origin abdiel
git push gitlab abdiel
```
Para agregar el css nota modificar la ruta segun el archivo y agregar los input.css
input.css:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
(Para desarrolladores) i gnerar el css
terminal:
```bash
npm install tailwindcss @tailwindcss/cli
```
terminal:
```bash
npx tailwindcss -i ./src/inicio/input.css -o ./src/inicio/output.css --minify
npx tailwindcss -i ./src/formulario_arbol/input.css -o ./src/formulario_arbol/output.css --minify
npx tailwindcss -i ./src/formulario_mantenimiento/input.css -o ./src/formulario_mantenimiento/output.css --minify
npx tailwindcss -i ./src/agregar_especies/input.css -o ./src/agregar_especies/output.css --minify
npx tailwindcss -i ./src/mapa_arboles/input.css -o ./src/mapa_arboles/output.css --minify
npx tailwindcss -i ./src/plagas/input.css -o ./src/plagas/output.css --minify
npx tailwindcss -i ./src/subespecies/input.css -o ./src/subespecies/output.css --minify
```
