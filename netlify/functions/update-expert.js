import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'PUT') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { id, name, fields, phone, whatsapp, whatsappMessage, email, intermediary, intermediaryPhone, notes, addedBy, lastContact, location, timezone, twitter, instagram } = await req.json();
    if (!id) return new Response(JSON.stringify({ success: false, error: 'شناسه الزامی است' }), { status: 400, headers });

    const result = await sql`UPDATE experts SET name = COALESCE(${name}, name), fields = COALESCE(${fields}, fields), phone = ${phone || null}, whatsapp = ${whatsapp || null}, whatsapp_message = ${whatsappMessage || null}, email = ${email || null}, intermediary = ${intermediary || null}, intermediary_phone = ${intermediaryPhone || null}, notes = ${notes || null}, added_by = COALESCE(${addedBy}, added_by), last_contact = COALESCE(${lastContact}, last_contact), location = ${location || null}, timezone = ${timezone || null}, twitter = ${twitter || null}, instagram = ${instagram || null}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING id, name, fields, phone, whatsapp, whatsapp_message as "whatsappMessage", email, intermediary, intermediary_phone as "intermediaryPhone", notes, added_by as "addedBy", added_by_username as "addedByUsername", last_contact as "lastContact", location, timezone, twitter, instagram`;
    if (result.length === 0) return new Response(JSON.stringify({ success: false, error: 'کارشناس یافت نشد' }), { status: 404, headers });
    return new Response(JSON.stringify({ success: true, data: result[0] }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/experts/update" };
