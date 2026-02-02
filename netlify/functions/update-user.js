import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'PUT') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { id, name, username, password } = await req.json();
    if (!id) return new Response(JSON.stringify({ success: false, error: 'شناسه الزامی است' }), { status: 400, headers });

    if (username) {
      const existing = await sql`SELECT id FROM users WHERE username = ${username} AND id != ${id}`;
      if (existing.length > 0) return new Response(JSON.stringify({ success: false, error: 'نام کاربری تکراری' }), { status: 400, headers });
    }

    const result = await sql`UPDATE users SET name = COALESCE(${name}, name), username = COALESCE(${username}, username), password = COALESCE(${password}, password) WHERE id = ${id} RETURNING id, name, username, is_admin as "isAdmin"`;
    if (result.length === 0) return new Response(JSON.stringify({ success: false, error: 'کاربر یافت نشد' }), { status: 404, headers });
    return new Response(JSON.stringify({ success: true, data: result[0] }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/users/update" };
