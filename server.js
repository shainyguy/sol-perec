/**
 * server.js — Express server for Railway deployment
 * Serves: Vite React SPA (dist/) + /api/* routes → Railway PostgreSQL
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['https://solperets.ru', 'https://sp-production-fb73.up.railway.app', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, cb) => { cb(null, !origin || ALLOWED_ORIGINS.includes(origin)); },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
});
app.use('/api/admin-auth', authLimiter);

// ── Dynamic API loader ────────────────────────────────────────────────────────
const cache = new Map();
async function loadHandler(name) {
  if (cache.has(name)) return cache.get(name);
  const mod = await import(`./api/${name}.js`);
  cache.set(name, mod.default);
  return mod.default;
}
function route(name) {
  return async (req, res) => {
    try {
      await (await loadHandler(name))(req, res);
    } catch (e) {
      console.error(`[${name}]`, e.message);
      if (!res.headersSent) res.status(500).json({ error: e.message });
    }
  };
}

// ── API routes ────────────────────────────────────────────────────────────────
const ROUTES = [
  'menu', 'orders', 'reservations', 'reviews', 'banquets',
  'settings', 'promotions', 'gallery', 'admin-auth',
  'analytics', 'action-log', 'blacklist',
  'delivery-zones', 'promocodes', 'waiter-orders',
  'order-status', 'migrate',
];
for (const r of ROUTES) app.all(`/api/${r}`, route(r));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  ok: true,
  ts: Date.now(),
  db: process.env.DATABASE_URL ? '✅ connected' : '❌ DATABASE_URL missing',
}));

// ── React SPA ─────────────────────────────────────────────────────────────────
const dist = path.join(__dirname, 'dist');
app.use(express.static(dist, { maxAge: '1d' }));

// Per-page meta injection for SEO (server-side, works without JS)
const PAGE_META = {
  '/':        { title: 'Соль и Перец — Кафе в Сходне | Шашлык, Плов, Банкеты',
                desc: 'Кафе Соль и Перец — вкусная домашняя кухня в Сходне. Шашлык, плов, гриль, банкеты. Доставка, бронирование столов. ул. Некрасова 15.' },
  '/menu':    { title: 'Меню — Соль и Перец | Сходня',
                desc: 'Меню кафе Соль и Перец в Сходне. Шашлык из баранины и телятины, садж, плов, супы, салаты, хачапури, паста, пицца. Доставка и самовывоз.' },
  '/reserve': { title: 'Бронирование стола — Соль и Перец | Сходня',
                desc: 'Забронируйте стол в кафе Соль и Перец в Сходне. Выберите место на схеме зала, укажите дату и время.' },
  '/banquet': { title: 'Банкеты и мероприятия — Соль и Перец | Сходня',
                desc: 'Организуем банкеты, дни рождения, корпоративы и свадьбы в кафе Соль и Перец в Сходне. Вместимость до 200 человек.' },
  '/reviews': { title: 'Отзывы — Соль и Перец | Сходня',
                desc: 'Отзывы гостей кафе Соль и Перец в Сходне. Узнайте, что говорят о нас посетители.' },
  '/contacts':{ title: 'Контакты — Соль и Перец | Сходня',
                desc: 'Контакты кафе Соль и Перец в Сходне. Адрес: ул. Некрасова 15, Химки. Телефон: 8 (925) 767-77-78.' },
  '/privacy': { title: 'Политика конфиденциальности — Соль и Перец',
                desc: 'Политика конфиденциальности кафе Соль и Перец. Обработка персональных данных, файлы cookie.' },
  '/terms':   { title: 'Договор оферты — Соль и Перец',
                desc: 'Договор публичной оферты кафе Соль и Перец. Условия бронирования, доставки и возврата.' },
  '/admin':   { title: 'Админ-панель — Соль и Перец',
                desc: 'Панель управления кафе Соль и Перец.' },
};
const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
function injectMeta(req, res) {
  const route = PAGE_META[req.path];
  if (!route) return res.send(indexHtml);
  const html = indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${route.desc}" />`);
  res.send(html);
}
app.get('*', injectMeta);

// ── Error handler (catches scanner bots: /..%c0%af.env etc.) ──────────────────
app.use((err, _req, res, _next) => {
  if (err instanceof URIError || err.message?.includes('decode')) {
    return res.status(400).json({ error: 'invalid path' });
  }
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀  Соль и Перец | http://localhost:${PORT}`);
  console.log(`   DATABASE_URL : ${process.env.DATABASE_URL ? '✅ set' : '❌ MISSING — add PostgreSQL in Railway'}`);
  console.log(`   ADMIN_PWD    : ${process.env.ADMIN_PASSWORD ? '✅ set' : '⚠️  using default admin2025'}`);
  console.log(`   Telegram     : ${process.env.TELEGRAM_BOT_TOKEN ? '✅ set' : '⚙️  configure in /admin → Settings'}\n`);
  if (!process.env.DATABASE_URL) {
    console.warn('  ⚠️  No DATABASE_URL! Run GET /api/migrate after adding PostgreSQL in Railway.\n');
  }
});
