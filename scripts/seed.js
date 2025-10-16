const { db } = require('@vercel/postgres');
async function createPlayersTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS players (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        number INT NOT NULL UNIQUE,
        size VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log(`Tabla "players" creada.`);
  } catch (error) { console.error('Error creando tabla:', error); throw error; }
}
async function main() {
  const client = await db.connect();
  await createPlayersTable(client);
  await client.end();
}
main().catch((err) => { console.error('Error inicializando DB:', err); });