import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'DELETE') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ success: false, error: 'شناسه الزامی است' }), { status: 400, headers });

    const user = await sql`SELECT is_admin FROM users WHERE id = ${id}`;
    if (user.length > 0 && user[0].is_admin) return new Response(JSON.stringify({ success: false, error: 'امکان حذف ادمین وجود ندارد' }), { status: 403, headers });

    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    if (result.length === 0) return new Response(JSON.stringify({ success: false, error: 'کاربر یافت نشد' }), { status: 404, headers });
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/users/delete" };
