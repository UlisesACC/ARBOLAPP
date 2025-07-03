const net = require('net');

const host = process.env.POSTGRES_HOST || 'postgres';
const port = process.env.POSTGRES_PORT || 5432;

const retryDelay = 2000;
const maxRetries = 10;
let attempts = 0;

function check() {
  const socket = net.createConnection(port, host, () => {
    console.log("🟢 PostgreSQL está listo. Iniciando app...");
    socket.end();
    require('./server.js');
  });

  socket.on('error', () => {
    attempts++;
    if (attempts >= maxRetries) {
      console.error("❌ No se pudo conectar a PostgreSQL.");
      process.exit(1);
    }
    console.log(`🔁 Esperando a PostgreSQL... intento ${attempts}/${maxRetries}`);
    setTimeout(check, retryDelay);
  });
}

check();
