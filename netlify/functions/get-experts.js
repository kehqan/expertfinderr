import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  
  try {
    const experts = await sql`SELECT id, name, fields, phone, whatsapp, whatsapp_message as "whatsappMessage", email, intermediary, intermediary_phone as "intermediaryPhone", notes, added_by as "addedBy", added_by_username as "addedByUsername", last_contact as "lastContact", location, timezone, twitter, instagram FROM experts ORDER BY created_at DESC`;
    return new Response(JSON.stringify({ success: true, data: experts }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/experts" };
