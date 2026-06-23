/**
 * seed.js — заполняет базу данных начальными данными
 * Запуск: node seed.js
 */
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:hQyGWknQBKPRDxBBzfaQAaGPDFqhMMDB@interchange.proxy.rlwy.net:49328/railway',
  ssl: { rejectUnauthorized: false },
});

const q = (sql, params = []) => pool.query(sql, params);

async function seed() {
  console.log('🌱 Начинаю заполнение базы...\n');

  // ── Таблицы ──────────────────────────────────────────────
  console.log('📦 Создаю таблицы...');
  const schema = `
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT,
      price INTEGER NOT NULL, category TEXT NOT NULL, image_url TEXT,
      calories INTEGER, cook_time INTEGER,
      is_gluten_free BOOLEAN DEFAULT false, is_lactose_free BOOLEAN DEFAULT false,
      is_bar BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
      is_special BOOLEAN DEFAULT false, original_price INTEGER,
      sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
      delivery_address TEXT, comment TEXT, items JSONB NOT NULL,
      total_amount INTEGER NOT NULL, status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY, guest_name TEXT NOT NULL, guest_phone TEXT NOT NULL,
      date TEXT NOT NULL, time TEXT NOT NULL, guests_count INTEGER DEFAULT 2,
      table_number INTEGER, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY, author_name TEXT NOT NULL, rating INTEGER NOT NULL,
      text TEXT NOT NULL, approved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS banquet_requests (
      id SERIAL PRIMARY KEY, contact_name TEXT NOT NULL, contact_phone TEXT NOT NULL,
      event_type TEXT, package_name TEXT, guests_count INTEGER, event_date TEXT,
      extra_services JSONB, estimated_total INTEGER, comment TEXT,
      status TEXT DEFAULT 'new', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS promotions (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      discount_text TEXT, expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY, url TEXT NOT NULL, caption TEXT,
      category TEXT DEFAULT 'general', sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY, key TEXT NOT NULL UNIQUE, value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await q(schema);
  console.log('✅ Таблицы созданы\n');

  // ── Settings ─────────────────────────────────────────────
  console.log('⚙️ Настройки...');
  await q(`INSERT INTO settings (key, value) VALUES
    ('telegram_bot_token', ''), ('telegram_chat_id', ''),
    ('site_phone', '+7 (925) 767-77-78'),
    ('site_address', 'Московская обл., Химки, ул. Некрасова 15')
    ON CONFLICT (key) DO NOTHING`);
  console.log('✅ Настройки добавлены\n');

  // ── Menu items: Kitchen ──────────────────────────────────
  console.log('🍽 Меню (кухня)...');

  const kitchenItems = [
    // Блюда с мангала
    { name: 'Шашлык из курицы', desc: 'Сочный шашлык из куриного филе, маринованный в кефире со специями', price: 450, cat: 'Блюда с мангала', img: '/images/dish-grill.jpg', cal: 320, time: 20 },
    { name: 'Шашлык из свинины', desc: 'Нежнейший шашлык из свиной шеи, маринованный в луке и уксусе', price: 550, cat: 'Блюда с мангала', img: '/images/dish-grill.jpg', cal: 400, time: 25 },
    { name: 'Шашлык из баранины', desc: 'Ароматный шашлык из молодой баранины с пряными травами', price: 650, cat: 'Блюда с мангала', img: '/images/dish-grill.jpg', cal: 380, time: 25, special: true },
    { name: 'Люля-кебаб из баранины', desc: 'Рубленый шашлык из баранины с луком и зеленью на мангале', price: 500, cat: 'Блюда с мангала', img: '/images/dish-grill.jpg', cal: 350, time: 20 },
    { name: 'Куриные крылья гриль', desc: 'Хрустящие куриные крылья в пикантном маринаде', price: 420, cat: 'Блюда с мангала', img: '/images/dish-grill.jpg', cal: 300, time: 20 },

    // Шашлык на костях
    { name: 'Свиная корейка на кости', desc: 'Свинина на кости с хрустящей корочкой и ароматными специями', price: 600, cat: 'Шашлык на костях', img: '/images/dish-grill.jpg', cal: 450, time: 30 },
    { name: 'Баранья корейка на кости', desc: 'Баранина на ребрышках с травами и чесноком', price: 700, cat: 'Шашлык на костях', img: '/images/dish-grill.jpg', cal: 420, time: 30 },

    // Овощи на мангале
    { name: 'Овощи гриль (ассорти)', desc: 'Баклажаны, перцы, помидоры, кабачки на мангале', price: 250, cat: 'Овощи на мангале', img: '/images/dish-grill.jpg', cal: 120, time: 15, gf: true, lf: true },

    // Рыба на мангале
    { name: 'Форель на мангале', desc: 'Целая форель, запечённая на мангале с лимоном и зеленью', price: 750, cat: 'Рыба на мангале', img: '/images/dish-grill.jpg', cal: 280, time: 25, gf: true, lf: true },

    // Садж на мангале
    { name: 'Садж из цыплёнка', desc: 'Азербайджанское блюдо — цыплёнок с овощами на мангале', price: 550, cat: 'Садж на мангале', img: '/images/dish-grill.jpg', cal: 350, time: 25 },
    { name: 'Садж из баранины', desc: 'Баранина с овощами и восточными специями в садже', price: 650, cat: 'Садж на мангале', img: '/images/dish-grill.jpg', cal: 400, time: 30 },

    // Супы
    { name: 'Солянка мясная', desc: 'Наваристый суп с несколькими видами мяса, маслинами и лимоном', price: 380, cat: 'Супы', img: '/images/dish-soup.jpg', cal: 250, time: 15 },
    { name: 'Лагман', desc: 'Густой суп с домашней лапшой, мясом и овощами по-восточному', price: 420, cat: 'Супы', img: '/images/dish-soup.jpg', cal: 300, time: 15 },
    { name: 'Борщ с пампушками', desc: 'Классический украинский борщ со сметаной и чесночными пампушками', price: 350, cat: 'Супы', img: '/images/dish-soup.jpg', cal: 220, time: 15 },
    { name: 'Куриный суп с лапшой', desc: 'Лёгкий куриный бульон с домашней лапшой и овощами', price: 280, cat: 'Супы', img: '/images/dish-soup.jpg', cal: 180, time: 10, gf: false, lf: true },

    // Горячие блюда
    { name: 'Котлета по-киевски', desc: 'Куриное филе с маслом и зеленью в хрустящей панировке', price: 480, cat: 'Горячие блюда', img: '/images/dish-grill.jpg', cal: 380, time: 20 },
    { name: 'Медальоны из свинины', desc: 'Свиные медальоны с грибным соусом', price: 520, cat: 'Горячие блюда', img: '/images/dish-grill.jpg', cal: 350, time: 20 },
    { name: 'Отбивная из индейки', desc: 'Нежная отбивная из индейки в панировке', price: 450, cat: 'Горячие блюда', img: '/images/dish-grill.jpg', cal: 280, time: 15, gf: false },

    // Шах плов
    { name: 'Шах-плов', desc: 'Плов по-азербайджански с бараниной, сухофруктами и каштанами в хрустящей корочке', price: 750, cat: 'Шах плов', img: '/images/dish-plov.jpg', cal: 500, time: 30, special: true },
    { name: 'Шах-плов с курицей', desc: 'Шах-плов с курицей, сухофруктами и шафраном', price: 600, cat: 'Шах плов', img: '/images/dish-plov.jpg', cal: 450, time: 30 },

    // Паста
    { name: 'Паста Карбонара', desc: 'Спагетти с беконом в сливочном соусе с пармезаном', price: 420, cat: 'Паста', img: '/images/dish-grill.jpg', cal: 450, time: 15 },
    { name: 'Паста Болоньезе', desc: 'Спагетти с мясным соусом по-итальянски', price: 390, cat: 'Паста', img: '/images/dish-grill.jpg', cal: 400, time: 15 },

    // Гарниры
    { name: 'Картофель фри', desc: 'Хрустящий картофель фри со специями', price: 180, cat: 'Гарниры', img: '/images/dish-grill.jpg', cal: 300, time: 10, gf: true, lf: true },
    { name: 'Рис с овощами', desc: 'Пропаренный рис с овощами и зеленью', price: 200, cat: 'Гарниры', img: '/images/dish-plov.jpg', cal: 220, time: 10, gf: true, lf: true },
    { name: 'Овощи на пару', desc: 'Микс из брокколи, цветной капусты и моркови', price: 190, cat: 'Гарниры', img: '/images/dish-salad.jpg', cal: 90, time: 10, gf: true, lf: true },

    // Салаты
    { name: 'Цезарь с курицей', desc: 'Классический салат Цезарь с куриным филе, пармезаном и соусом', price: 420, cat: 'Салаты', img: '/images/dish-salad.jpg', cal: 320, time: 10, gf: false },
    { name: 'Греческий салат', desc: 'Салат с фетой, огурцами, помидорами и оливками', price: 350, cat: 'Салаты', img: '/images/dish-salad.jpg', cal: 180, time: 10, gf: true, lf: false },
    { name: 'Оливье', desc: 'Классический салат Оливье с курицей и домашним майонезом', price: 320, cat: 'Салаты', img: '/images/dish-salad.jpg', cal: 250, time: 10 },
    { name: 'Сельдь под шубой', desc: 'Слоёный салат с сельдью, свёклой и майонезом', price: 350, cat: 'Салаты', img: '/images/dish-salad.jpg', cal: 280, time: 10 },
    { name: 'Чабан-салат', desc: 'Салат из свежих овощей по-азербайджански с зеленью', price: 300, cat: 'Салаты', img: '/images/dish-salad.jpg', cal: 120, time: 10, gf: true, lf: true },

    // Холодные закуски
    { name: 'Сырная тарелка', desc: 'Ассорти из 5 видов сыра с мёдом и орехами', price: 650, cat: 'Холодные закуски', img: '/images/dish-salad.jpg', cal: 400, time: 5, gf: true },
    { name: 'Мясная тарелка', desc: 'Ассорти из мясных деликатесов с горчицей и хреном', price: 580, cat: 'Холодные закуски', img: '/images/dish-grill.jpg', cal: 350, time: 5 },
    { name: 'Ассорти солений', desc: 'Домашние соленья: огурцы, помидоры, капуста, грибы', price: 280, cat: 'Холодные закуски', img: '/images/dish-salad.jpg', cal: 60, time: 5, gf: true, lf: true },

    // Закуски к пиву
    { name: 'Кольца кальмара', desc: 'Хрустящие кольца кальмара с соусом тартар', price: 350, cat: 'Закуски к пиву', img: '/images/dish-grill.jpg', cal: 300, time: 12 },
    { name: 'Сырные палочки', desc: 'Сыр моцарелла в хрустящей панировке', price: 320, cat: 'Закуски к пиву', img: '/images/dish-grill.jpg', cal: 350, time: 10 },
    { name: 'Наггетсы', desc: 'Куриные наггетсы с соусом на выбор', price: 300, cat: 'Закуски к пиву', img: '/images/dish-grill.jpg', cal: 320, time: 12 },

    // Соусы
    { name: 'Соус ткемали', desc: 'Грузинский сливовый соус с чесноком и зеленью', price: 80, cat: 'Соусы', img: '/images/dish-grill.jpg', cal: 40, time: 2, gf: true, lf: true },
    { name: 'Соус наршараб', desc: 'Гранатовый соус к мясу', price: 80, cat: 'Соусы', img: '/images/dish-grill.jpg', cal: 50, time: 2, gf: true, lf: true },
    { name: 'Сметанный соус', desc: 'Домашняя сметана с зеленью и чесноком', price: 70, cat: 'Соусы', img: '/images/dish-grill.jpg', cal: 80, time: 2, gf: true, lf: false },

    // Напитки безалкогольные
    { name: 'Морс клюквенный', desc: 'Домашний морс из свежей клюквы', price: 150, cat: 'Напитки', img: '/images/dish-salad.jpg', cal: 80, time: 2, gf: true, lf: true },
    { name: 'Лимонад', desc: 'Освежающий лимонад с мятой и лимоном', price: 180, cat: 'Напитки', img: '/images/dish-salad.jpg', cal: 90, time: 2, gf: true, lf: true },
    { name: 'Чай чёрный', desc: 'Индийский чёрный чай', price: 100, cat: 'Напитки', img: '/images/dish-dessert.jpg', cal: 0, time: 5, gf: true, lf: true },
    { name: 'Чай зелёный', desc: 'Китайский зелёный чай', price: 100, cat: 'Напитки', img: '/images/dish-dessert.jpg', cal: 0, time: 5, gf: true, lf: true },
    { name: 'Кофе эспрессо', desc: 'Классический эспрессо из итальянской обжарки', price: 150, cat: 'Напитки', img: '/images/dish-dessert.jpg', cal: 5, time: 3, gf: true, lf: true },
    { name: 'Кофе капучино', desc: 'Эспрессо с нежной молочной пеной', price: 200, cat: 'Напитки', img: '/images/dish-dessert.jpg', cal: 80, time: 5, gf: true, lf: false },
    { name: 'Вода минеральная', desc: 'Минеральная вода газированная/негазированная 0.5л', price: 80, cat: 'Напитки', img: '/images/dish-salad.jpg', cal: 0, time: 1, gf: true, lf: true },
    { name: 'Сок свежевыжатый', desc: 'Апельсиновый / грейпфрутовый / яблочный', price: 250, cat: 'Напитки', img: '/images/dish-salad.jpg', cal: 100, time: 5, gf: true, lf: true },

    // Авторские чаи
    { name: 'Облепиховый чай', desc: 'Чай с облепихой, мёдом и имбирём', price: 250, cat: 'Авторские чаи', img: '/images/dish-dessert.jpg', cal: 60, time: 7, gf: true, lf: true },
    { name: 'Чай с барбарисом и мятой', desc: 'Травяной чай с ягодами барбариса и свежей мятой', price: 230, cat: 'Авторские чаи', img: '/images/dish-dessert.jpg', cal: 30, time: 7, gf: true, lf: true },

    // Мороженое
    { name: 'Мороженое пломбир', desc: 'Классический пломбир с ванилью', price: 180, cat: 'Мороженое', img: '/images/dish-dessert.jpg', cal: 200, time: 3, gf: true, lf: false },
    { name: 'Мороженое шоколадное', desc: 'Шоколадное мороженое с какао', price: 200, cat: 'Мороженое', img: '/images/dish-dessert.jpg', cal: 220, time: 3, gf: true, lf: false },

    // Десерты
    { name: 'Тирамису', desc: 'Итальянский десерт с маскарпоне и кофе эспрессо', price: 350, cat: 'Десерты', img: '/images/dish-dessert.jpg', cal: 320, time: 5 },
    { name: 'Чизкейк', desc: 'Нежный чизкейк с ягодным соусом', price: 320, cat: 'Десерты', img: '/images/dish-dessert.jpg', cal: 350, time: 5 },
    { name: 'Пахлава', desc: 'Азербайджанская пахлава с орехами и мёдом', price: 250, cat: 'Десерты', img: '/images/dish-dessert.jpg', cal: 400, time: 3, gf: false },
  ];

  for (const item of kitchenItems) {
    await q(`INSERT INTO menu_items (name, description, price, category, image_url, calories, cook_time, is_gluten_free, is_lactose_free, is_special, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [item.name, item.desc, item.price, item.cat, item.img, item.cal || null, item.time || null,
       item.gf || false, item.lf || false, item.special || false, 0]);
  }
  console.log(`✅ Добавлено ${kitchenItems.length} блюд кухни\n`);

  // ── Menu items: Bar ─────────────────────────────────────
  console.log('🍸 Меню (бар)...');
  const barItems = [
    { name: 'Мохито', desc: 'Классический мохито с мятой, лаймом и содовой', price: 380, cat: 'Коктейли', img: '/images/dish-salad.jpg' },
    { name: 'Пина Колада', desc: 'Ром, кокосовое молоко, ананасовый сок', price: 420, cat: 'Коктейли', img: '/images/dish-salad.jpg' },
    { name: 'Кровавая Мэри', desc: 'Водка, томатный сок, специи', price: 350, cat: 'Коктейли', img: '/images/dish-salad.jpg' },
    { name: 'Лонг Айленд', desc: 'Крепкий коктейль из 5 видов алкоголя', price: 450, cat: 'Коктейли', img: '/images/dish-salad.jpg' },
    { name: 'Вино красное сухое', desc: 'Италия, бокал 150 мл', price: 300, cat: 'Вино', img: '/images/dish-salad.jpg' },
    { name: 'Вино белое сухое', desc: 'Франция, бокал 150 мл', price: 300, cat: 'Вино', img: '/images/dish-salad.jpg' },
    { name: 'Шампанское брют', desc: 'Игристое вино, бокал', price: 400, cat: 'Шампанское', img: '/images/dish-salad.jpg' },
    { name: 'Пиво светлое', desc: 'Разливное светлое пиво 0.5л', price: 200, cat: 'Пиво', img: '/images/dish-salad.jpg' },
    { name: 'Пиво тёмное', desc: 'Разливное тёмное пиво 0.5л', price: 220, cat: 'Пиво', img: '/images/dish-salad.jpg' },
    { name: 'Виски Jameson', desc: 'Ирландский виски, порция 40 мл', price: 350, cat: 'Виски', img: '/images/dish-salad.jpg' },
    { name: 'Виски Jack Daniels', desc: 'Американский виски, порция 40 мл', price: 400, cat: 'Виски', img: '/images/dish-salad.jpg' },
    { name: 'Коньяк Hennessy VS', desc: 'Французский коньяк, порция 40 мл', price: 500, cat: 'Коньяк', img: '/images/dish-salad.jpg' },
    { name: 'Водка' + ' Russian Standard', desc: 'Классическая водка, порция 50 мл', price: 200, cat: 'Водка', img: '/images/dish-salad.jpg' },
    { name: 'Водка Finlandia', desc: 'Финская водка премиум, порция 50 мл', price: 280, cat: 'Водка', img: '/images/dish-salad.jpg' },
    { name: 'Текила Sauza Silver', desc: 'Серебряная текила, порция 40 мл', price: 300, cat: 'Текила', img: '/images/dish-salad.jpg' },
    { name: 'Ром Bacardi Carta Blanca', desc: 'Белый ром, порция 40 мл', price: 320, cat: 'Ром', img: '/images/dish-salad.jpg' },
  ];

  for (const item of barItems) {
    await q(`INSERT INTO menu_items (name, description, price, category, image_url, is_bar, sort_order)
      VALUES ($1,$2,$3,$4,$5,true,0)`,
      [item.name, item.desc, item.price, item.cat, item.img]);
  }
  console.log(`✅ Добавлено ${barItems.length} позиций бара\n`);

  // ── Promotions ──────────────────────────────────────────
  console.log('🔥 Акции...');
  const promos = [
    { title: 'Скидка на день рождения', desc: 'Приведи друга и получи скидку 15% на весь заказ в честь дня рождения!', discount: '-15%', expires: new Date(Date.now() + 90 * 86400000).toISOString() },
    { title: 'Бизнес-ланч', desc: 'Скидка 20% на комплексный обед в будни с 12:00 до 16:00', discount: '-20%', expires: new Date(Date.now() + 60 * 86400000).toISOString() },
    { title: 'Счастливый час', desc: 'Каждый день с 18:00 до 20:00 — скидка 10% на все напитки из бара', discount: '-10%', expires: new Date(Date.now() + 30 * 86400000).toISOString() },
  ];
  for (const p of promos) {
    await q(`INSERT INTO promotions (title, description, discount_text, expires_at, is_active) VALUES ($1,$2,$3,$4,true)`,
      [p.title, p.desc, p.discount, p.expires]);
  }
  console.log(`✅ Добавлено ${promos.length} акций\n`);

  // ── Gallery ─────────────────────────────────────────────
  console.log('🖼 Галерея...');
  const galleryItems = [
    { url: '/images/gallery-1.jpg', caption: 'Уютный зал кафе', cat: 'interior' },
    { url: '/images/gallery-2.jpg', caption: 'Приятная атмосфера', cat: 'interior' },
    { url: '/images/gallery-3.jpg', caption: 'Наша кухня', cat: 'kitchen' },
    { url: '/images/gallery-4.jpg', caption: 'Банкетный зал', cat: 'interior' },
    { url: '/images/gallery-5.jpg', caption: 'Живая музыка', cat: 'events' },
    { url: '/images/gallery-6.jpg', caption: 'Гости кафе', cat: 'guests' },
    { url: '/images/interior.jpg', caption: 'Интерьер', cat: 'interior' },
    { url: '/images/banquet.jpg', caption: 'Банкетная зона', cat: 'interior' },
  ];
  for (const g of galleryItems) {
    await q(`INSERT INTO gallery (url, caption, category) VALUES ($1,$2,$3)`, [g.url, g.caption, g.cat]);
  }
  console.log(`✅ Добавлено ${galleryItems.length} фото\n`);

  console.log('🎉 База данных успешно заполнена!');
  await pool.end();
}

seed().catch(e => { console.error('❌', e); process.exit(1); });
