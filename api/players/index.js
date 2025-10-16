const { sql } = require('@vercel/postgres');

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM players ORDER BY number ASC;`;
      return response.status(200).json({ players: rows });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  if (request.method === 'POST') {
    try {
      const { name, number, size } = request.body;
      if (!name || !number || !size) {
        return response.status(400).json({ error: 'Todos los campos son requeridos' });
      }
      await sql`INSERT INTO players (name, number, size) VALUES (${name}, ${number}, ${size});`;
      return response.status(201).json({ message: 'Jugador registrado' });
    } catch (error) {
      if (error.code === '23505') {
        return response.status(409).json({ error: 'El número de camiseta ya está en uso.' });
      }
      return response.status(500).json({ error: error.message });
    }
  }
  
  return response.status(405).end(); // Method Not Allowed
}