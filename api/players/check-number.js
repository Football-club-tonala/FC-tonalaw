const { sql } = require('@vercel/postgres');

export default async function handler(request, response) {
  const { number } = request.query;
  if (!number) {
    return response.status(400).json({ error: 'Número es requerido' });
  }
  try {
    const { rows } = await sql`SELECT 1 FROM players WHERE number = ${number};`;
    return response.status(200).json({ isTaken: rows.length > 0 });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}