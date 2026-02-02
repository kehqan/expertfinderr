import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405, headers });
  
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'نام کاربری و رمز عبور الزامی است' }), { status: 400, headers });
    }

    const users = await sql`SELECT id, name, username, is_admin FROM users WHERE username = ${username} AND password = ${password}`;
    if (users.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'نام کاربری یا رمز عبور اشتباه است' }), { status: 401, headers });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: { id: users[0].id, name: users[0].name, username: users[0].username, isAdmin: users[0].is_admin }
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/login" };
