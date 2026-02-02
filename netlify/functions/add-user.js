import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { name, username, password } = await req.json();
    if (!name || !username || !password) return new Response(JSON.stringify({ success: false, error: 'تمام فیلدها الزامی است' }), { status: 400, headers });

    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.length > 0) return new Response(JSON.stringify({ success: false, error: 'این نام کاربری قبلاً استفاده شده' }), { status: 400, headers });

    const result = await sql`INSERT INTO users (name, username, password) VALUES (${name}, ${username}, ${password}) RETURNING id, name, username, is_admin as "isAdmin"`;
    return new Response(JSON.stringify({ success: true, data: result[0] }), { status: 201, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/users/add" };
