import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { username, password } = await req.json();
    const users = await sql`SELECT id FROM users WHERE username = ${username} AND password = ${password}`;
    return new Response(JSON.stringify({ success: users.length > 0, error: users.length === 0 ? 'رمز عبور اشتباه است' : undefined }), { status: users.length > 0 ? 200 : 401, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/verify-password" };
