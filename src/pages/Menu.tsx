import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, Phone, Bike, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import MenuCard, { type MenuItem } from '../components/MenuCard';
import { getMenuItems } from '../lib/db';

// ── Category lists ─────────────────────────────────────────────────────────────
export const FOOD_CATS = [
  { id: 'all',              label: 'Всё' },
  { id: 'Шашлык',           label: '🔥 Шашлык' },
  { id: 'Сеты',             label: '🥩 Сеты' },
  { id: 'Овощи на гриле',   label: '🫑 Овощи на гриле' },
  { id: 'Садж',             label: '🥘 Садж' },
  { id: 'Ассорти овощей',   label: '🫑 Ассорти овощей' },
  { id: 'Холодные закуски', label: '🧀 Холодные закуски' },
  { id: 'Салаты',           label: '🥗 Салаты' },
  { id: 'Хачапури',         label: '🧀 Хачапури' },
  { id: 'Жульен',           label: '♨️ Жульен' },
  { id: 'Супы',             label: '🍲 Супы' },
  { id: 'Плов',             label: '🍚 Плов' },
  { id: 'Хинкали',          label: '🥟 Хинкали' },
  { id: 'Горячее',          label: '♨️ Горячее' },
  { id: 'Рыба',             label: '🐟 Рыба' },
  { id: 'Котлеты',          label: '🥩 Котлеты' },
  { id: 'Гарниры',          label: '🥔 Гарниры' },
  { id: 'Паста',            label: '🍝 Паста' },
  { id: 'Кутабы',           label: '🥟 Кутабы' },
  { id: 'Соусы',            label: '🫙 Соусы' },
  { id: 'Десерты',          label: '🍰 Десерты' },
  { id: 'Чай',              label: '🍵 Чай' },
  { id: 'Завтрак',          label: '🌅 Завтрак' },
  { id: 'Пицца',            label: '🍕 Пицца' },
  { id: 'Хлеб',             label: '🍞 Хлеб' },
  { id: 'Фрукты',           label: '🍎 Фрукты' },
];

export const BAR_CATS = [
  { id: 'all',              label: 'Всё' },
  { id: 'Пиво',             label: '🍺 Пиво' },
  { id: 'Сидр и Медовуха',  label: '🍏 Сидр и Медовуха' },
  { id: 'Коктейли',         label: '🍹 Коктейли' },
  { id: 'Безалкогольное',   label: '🚫 Безалкогольное' },
];

export default function Menu() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const isQrMode = !!tableNumber;

  const [items, setItems]               = useState<MenuItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]             = useState('');
  const [showBar, setShowBar]           = useState(false);
  const [filterGF, setFilterGF]         = useState(false);
  const [filterLF, setFilterLF]         = useState(false);
  const searchRef                       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setActiveCategory('all');
    getMenuItems({ bar: showBar })
      .then(data => { setItems(data as MenuItem[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [showBar]);

  useEffect(() => {
    document.title = showBar
      ? 'Меню бара — Соль и Перец | Сходня'
      : 'Меню ресторана Соль и Перец — Шашлык, Плов, Хачапури в Сходне';
  }, [showBar]);

  const CATS = showBar ? BAR_CATS : FOOD_CATS;

  const filtered = items.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGF && !item.is_gluten_free) return false;
    if (filterLF && !item.is_lactose_free) return false;
    return true;
  });

  const predefinedIds = CATS.filter(c => c.id !== 'all').map(c => c.id);
  const extraCats = [...new Set(filtered.map(i => i.category))]
    .filter(cat => !predefinedIds.includes(cat))
    .map(cat => ({ id: cat, label: cat }));
  const allCatsForGroup = [...CATS.filter(c => c.id !== 'all'), ...extraCats];

  const grouped = allCatsForGroup
    .map(c => ({ ...c, items: filtered.filter(i => i.category === c.id) }))
    .filter(c => c.items.length > 0);

  const dynamicCatTabs = [
    { id: 'all', label: 'Всё' },
    ...allCatsForGroup.filter(c => filtered.some(i => i.category === c.id)),
  ];

  // Featured (is_special) items for top section
  const featured = items.filter(i => i.is_special && !i.is_bar).slice(0, 4);

  return (
    <div className="min-h-screen bg-sp-darkest">
      <title>
        {showBar
          ? 'Меню бара — Соль и Перец | Сходня'
          : 'Меню ресторана Соль и Перец — Шашлык, Плов, Хачапури в Сходне'}
      </title>
      <meta
        name="description"
        content={showBar
          ? 'Барное меню кафе Соль и Перец в Сходне. Пиво, сидр, коктейли, безалкогольные напитки.'
          : 'Меню ресторана Соль и Перец в Сходне: шашлык из баранины, плов, хачапури, садж, хинкали. Доставка от 1500 ₽ бесплатно. Работаем ежедневно с 09:00.'}
      />
      <meta property="og:title" content="Меню — Соль и Перец" />
      <meta property="og:image" content="/images/dish-grill.jpg" />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className="relative pt-20 pb-0 overflow-hidden">
        {/* Bg image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/dish-grill.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sp-darkest/60 via-sp-dark to-sp-darkest" />

        <div className="relative container mx-auto px-4 py-10 md:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {isQrMode && (
              <div className="inline-flex items-center gap-2 bg-sp-orange/15 border border-sp-orange/30 text-sp-orange text-xs px-4 py-1.5 rounded-full mb-4">
                <QrCode size={13} /> Стол №{tableNumber} · Меню для просмотра
              </div>
            )}

            <h1 className="font-display text-4xl md:text-5xl text-sp-cream font-bold mb-2 leading-tight">
              {showBar ? 'Меню бара' : 'Наше меню'}
            </h1>
            <p className="text-sp-cream/50 text-sm md:text-base mb-5">
              {showBar
                ? 'Широкий выбор напитков на любой вкус'
                : 'Шашлык на мангале, плов, хачапури и многое другое'}
            </p>

            {/* Social proof + delivery strip */}
            {!showBar && (
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-sp-cream/50 bg-white/5 border border-white/6 px-3 py-1.5 rounded-full">
                  <Star size={11} className="text-yellow-500 fill-yellow-500" />
                  4.8 на Яндекс · 100+ отзывов
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sp-cream/50 bg-white/5 border border-white/6 px-3 py-1.5 rounded-full">
                  <Bike size={11} className="text-sp-orange" />
                  Доставка от 40 мин · бесплатно от 1 500 ₽
                </div>
              </div>
            )}

            {/* Tab switcher + PDF link row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowBar(false)}
                className={`tab-btn ${!showBar ? 'tab-btn-active' : ''}`}
              >
                🍽 Кухня
              </button>
              <button
                onClick={() => setShowBar(true)}
                className={`tab-btn ${showBar ? 'tab-btn-active' : ''}`}
              >
                🍸 Бар
              </button>
              <a
                href="https://docs.google.com/gview?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmosakowskibartle-tech%2Fmenu%2Fmain%2Fsolperets%20menu.pdf&embedded=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sp-cream/50 hover:text-sp-cream border border-white/10 hover:border-white/20 text-xs px-3 py-1.5 rounded-full transition-all"
              >
                📄 PDF меню
              </a>
            </div>

            {/* Bar warning */}
            {showBar && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl max-w-lg">
                <p className="text-red-400 text-xs font-medium flex items-start gap-2">
                  <span className="text-sm mt-0.5 flex-shrink-0">🔞</span>
                  <span>
                    <strong>18+</strong> Алкогольная продукция для ознакомления. Не публичная оферта.
                    Продажа алкоголя дистанционным способом запрещена.{' '}
                    <span className="text-red-400/50">Чрезмерное употребление алкоголя вредит здоровью.</span>
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ══ STICKY FILTERS ════════════════════════════════════════════════════ */}
      <div className="sticky top-16 md:top-20 z-30 bg-sp-darkest/97 backdrop-blur-xl border-b border-white/[0.05] py-3 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 flex flex-col gap-2.5">
          {/* Search + checkboxes */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative flex-shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sp-cream/35" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Поиск по меню..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input pl-8 py-2 text-sm w-44 md:w-56"
                aria-label="Поиск блюд"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sp-cream/30 hover:text-sp-cream/60 transition-colors"
                  aria-label="Очистить поиск"
                >
                  ✕
                </button>
              )}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={filterGF} onChange={e => setFilterGF(e.target.checked)} className="accent-sp-orange w-3.5 h-3.5" />
              <span className="text-sp-cream/55 text-xs">Без глютена</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={filterLF} onChange={e => setFilterLF(e.target.checked)} className="accent-sp-orange w-3.5 h-3.5" />
              <span className="text-sp-cream/55 text-xs">Без лактозы</span>
            </label>
            {/* Mobile call CTA */}
            <a
              href="tel:+79257677778"
              className="ml-auto flex items-center gap-1.5 text-xs text-sp-orange border border-sp-orange/30 hover:bg-sp-orange/10 px-3 py-1.5 rounded-full transition-all flex-shrink-0"
            >
              <Phone size={11} /> Заказать
            </a>
          </div>

          {/* Category scroll tabs */}
          <div className="flex gap-2 pb-0.5 category-scroll -mb-0.5">
            {dynamicCatTabs.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`category-tab flex-shrink-0 ${activeCategory === c.id ? 'category-tab-active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 py-8">

        {/* Featured / Хиты — shown only in "all" view when not searching */}
        {!loading && !showBar && activeCategory === 'all' && !search && featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-xl md:text-2xl text-sp-cream font-bold">
                Хиты продаж
              </h2>
              <span className="text-sp-cream/25 text-sm font-normal">{featured.length} позиции</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {featured.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <MenuCard item={item} hideCart={isQrMode} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={{ height: 200 }} />
            ))}
          </div>
        )}

        {/* Single category view */}
        {!loading && activeCategory !== 'all' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} hideCart={isQrMode} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* All categories grouped */}
        {!loading && activeCategory === 'all' && (
          <div className="flex flex-col gap-10">
            {grouped.map((group, gi) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: gi * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-xl md:text-2xl text-sp-cream font-bold" id={`cat-${group.id}`}>
                    {group.label}
                  </h2>
                  <span className="text-sp-cream/25 text-sm font-normal">{group.items.length} позиций</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.items.map(item => (
                    <MenuCard key={item.id} item={item} hideCart={isQrMode} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4 select-none" aria-hidden="true">🔍</div>
            <div className="text-sp-cream/50 text-lg font-medium mb-2">Ничего не найдено</div>
            <div className="text-sp-cream/30 text-sm mb-6">Попробуйте изменить запрос или фильтры</div>
            <button
              onClick={() => { setSearch(''); setFilterGF(false); setFilterLF(false); setActiveCategory('all'); }}
              className="inline-flex items-center gap-2 bg-sp-orange/15 hover:bg-sp-orange/25 text-sp-orange border border-sp-orange/25 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              Сбросить фильтры
            </button>
          </motion.div>
        )}
      </div>

      {/* ══ BOTTOM CTA STRIP ══════════════════════════════════════════════════ */}
      {!isQrMode && !loading && (
        <div className="border-t border-white/5 bg-sp-dark py-10 mt-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl text-sp-cream font-bold mb-1">
                  Хотите за стол или заказать на дом?
                </h3>
                <p className="text-sp-cream/45 text-sm">Мангал горит — шашлык ждёт вас</p>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <Link
                  to="/reserve"
                  className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/25"
                >
                  Забронировать стол
                </Link>
                <a
                  href="tel:+79257677778"
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/35 text-sp-cream font-medium px-6 py-3 rounded-full text-sm transition-all hover:bg-white/5"
                >
                  <Phone size={15} /> 8 (925) 767-77-78
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
