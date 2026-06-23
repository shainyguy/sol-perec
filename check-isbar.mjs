import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:hQyGWknQBKPRDxBBzfaQAaGPDFqhMMDB@interchange.proxy.rlwy.net:49328/railway',
  ssl: { rejectUnauthorized: false },
});
const r = await pool.query("SELECT id, name, category, is_bar FROM menu_items WHERE category IN ($1,$2,$3,$4) ORDER BY category, id", ['Пиво','Сидр и Медовуха','Коктейли','Безалкогольное']);
console.log(JSON.stringify(r.rows, null, 2));
await pool.end();
