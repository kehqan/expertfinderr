import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { name, fields, phone, whatsapp, whatsappMessage, email, intermediary, intermediaryPhone, notes, addedBy, addedByUsername, lastContact, location, timezone, twitter, instagram } = await req.json();
    if (!name || !addedBy) return new Response(JSON.stringify({ success: false, error: 'نام کارشناس الزامی است' }), { status: 400, headers });

    const result = await sql`INSERT INTO experts (name, fields, phone, whatsapp, whatsapp_message, email, intermediary, intermediary_phone, notes, added_by, added_by_username, last_contact, location, timezone, twitter, instagram) VALUES (${name}, ${fields || []}, ${phone || null}, ${whatsapp || null}, ${whatsappMessage || null}, ${email || null}, ${intermediary || null}, ${intermediaryPhone || null}, ${notes || null}, ${addedBy}, ${addedByUsername || null}, ${lastContact || new Date().toLocaleDateString('fa-IR')}, ${location || null}, ${timezone || null}, ${twitter || null}, ${instagram || null}) RETURNING id, name, fields, phone, whatsapp, whatsapp_message as "whatsappMessage", email, intermediary, intermediary_phone as "intermediaryPhone", notes, added_by as "addedBy", added_by_username as "addedByUsername", last_contact as "lastContact", location, timezone, twitter, instagram`;
    return new Response(JSON.stringify({ success: true, data: result[0] }), { status: 201, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/experts/add" };
