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