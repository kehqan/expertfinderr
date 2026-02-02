import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create experts table with added_by_username
    await sql`
      CREATE TABLE IF NOT EXISTS experts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        fields TEXT[] DEFAULT '{}',
        phone VARCHAR(50),
        whatsapp VARCHAR(50),
        whatsapp_message TEXT,
        email VARCHAR(255),
        intermediary VARCHAR(255),
        intermediary_phone VARCHAR(50),
        notes TEXT,
        added_by VARCHAR(255) NOT NULL,
        added_by_username VARCHAR(255),
        last_contact VARCHAR(50),
        location VARCHAR(255),
        timezone VARCHAR(100),
        twitter VARCHAR(255),
        instagram VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create expertise_fields table
    await sql`
      CREATE TABLE IF NOT EXISTS expertise_fields (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create admin user if not exists
    const adminExists = await sql`SELECT COUNT(*) as count FROM users WHERE username = 'adminfarda'`;
    if (parseInt(adminExists[0].count) === 0) {
      await sql`INSERT INTO users (name, username, password, is_admin) VALUES ('admin', 'adminfarda', 'tehranprague', TRUE)`;
    }

    // Add default fields if empty
    const existingFields = await sql`SELECT COUNT(*) as count FROM expertise_fields`;
    if (parseInt(existingFields[0].count) === 0) {
      const defaultFields = [
        'اقتصاد', 'بانکداری', 'بورس', 'سیاست داخلی', 'سیاست خارجی',
        'خاورمیانه', 'روابط بین‌الملل', 'فناوری', 'هوش مصنوعی',
        'امنیت سایبری', 'حقوق بشر', 'حقوق زنان', 'جامعه مدنی',
        'محیط زیست', 'تغییرات اقلیمی', 'انرژی', 'نفت و گاز',
        'بهداشت و سلامت', 'آموزش', 'فرهنگ و هنر', 'ورزش',
        'کشاورزی', 'صنعت', 'حمل و نقل', 'مسکن', 'نظامی و امنیتی'
      ];
      for (const field of defaultFields) {
        await sql`INSERT INTO expertise_fields (name) VALUES (${field}) ON CONFLICT (name) DO NOTHING`;
      }
    }

    // Add columns if they don't exist
    try {
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50)`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS whatsapp_message TEXT`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS added_by_username VARCHAR(255)`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS location VARCHAR(255)`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS timezone VARCHAR(100)`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS twitter VARCHAR(255)`;
      await sql`ALTER TABLE experts ADD COLUMN IF NOT EXISTS instagram VARCHAR(255)`;
    } catch (e) {}

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: "/api/init-db" };
