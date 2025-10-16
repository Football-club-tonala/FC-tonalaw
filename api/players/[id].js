const { sql } = require('@vercel/postgres');

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === 'PUT') {
    try {
      const { name, number, size } = request.body;
      await sql`UPDATE players SET name = ${name}, number = ${number}, size = ${size} WHERE id = ${id};`;
      return response.status(200).json({ message: 'Jugador actualizado' });
    } catch (error) {
       if (error.code === '23505') {
        return response.status(409).json({ error: 'Ese número ya lo usa otro jugador.' });
      }
      return response.status(500).json({ error: error.message });
    }
  }

  if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM players WHERE id = ${id};`;
      return response.status(200).json({ message: 'Jugador eliminado' });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
  
  return response.status(405).end(); // Method Not Allowed
}