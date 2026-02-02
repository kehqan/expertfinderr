import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ success: false }), { status: 405, headers });
  
  try {
    const { experts, addedBy, addedByUsername } = await req.json();
    if (!experts || !Array.isArray(experts) || experts.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'لیست خالی است' }), { status: 400, headers });
    }

    let imported = 0;
    let errors = [];

    for (let i = 0; i < experts.length; i++) {
      const e = experts[i];
      try {
        let fields = e.fields || [];
        if (typeof fields === 'string') fields = fields.split(/[،,]/).map(f => f.trim()).filter(f => f);

        await sql`INSERT INTO experts (name, fields, phone, whatsapp, whatsapp_message, email, intermediary, intermediary_phone, notes, added_by, added_by_username, last_contact, location, timezone, twitter, instagram) VALUES (${e.name || 'بدون نام'}, ${fields}, ${e.phone || null}, ${e.whatsapp || null}, ${e.whatsappMessage || e.whatsapp_message || null}, ${e.email || null}, ${e.intermediary || null}, ${e.intermediaryPhone || e.intermediary_phone || null}, ${e.notes || null}, ${addedBy}, ${addedByUsername}, ${e.lastContact || e.last_contact || new Date().toLocaleDateString('fa-IR')}, ${e.location || null}, ${e.timezone || null}, ${e.twitter || null}, ${e.instagram || null})`;
        imported++;
      } catch (err) {
        errors.push(`ردیف ${i + 1}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, imported, total: experts.length, errors: errors.length > 0 ? errors : undefined }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/experts/import" };
