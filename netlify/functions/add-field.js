import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { name } = await req.json();
    if (!name || !name.trim()) return new Response(JSON.stringify({ success: false, error: 'نام الزامی است' }), { status: 400, headers });

    const result = await sql`INSERT INTO expertise_fields (name) VALUES (${name.trim()}) ON CONFLICT (name) DO NOTHING RETURNING id, name`;
    if (result.length === 0) return new Response(JSON.stringify({ success: false, error: 'این حوزه قبلاً وجود دارد' }), { status: 400, headers });
    return new Response(JSON.stringify({ success: true, data: result[0] }), { status: 201, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/fields/add" };
