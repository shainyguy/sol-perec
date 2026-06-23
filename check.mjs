import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:hQyGWknQBKPRDxBBzfaQAaGPDFqhMMDB@interchange.proxy.rlwy.net:49328/railway', ssl: { rejectUnauthorized: false } });
const r = await pool.query("SELECT id, name, category, is_bar FROM menu_items WHERE is_bar = true ORDER BY category LIMIT 10");
for (const row of r.rows) console.log(row.id, row.name, row.category, row.is_bar);
await pool.end();
