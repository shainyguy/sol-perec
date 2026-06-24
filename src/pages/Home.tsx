import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Star, Clock, Flame, MapPin, Phone, Shield, Trophy,
  Sparkles, ChefHat, Wine, Music, Camera, ArrowRight, Heart,
  ShoppingBag, Bike, Zap, Gift, Users,
} from 'lucide-react';
import MenuCard, { type MenuItem } from '../components/MenuCard';
import { getGallery, getReviews, getPromotions } from '../lib/db';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Review { id: number; author_name: string; rating: number; text: string; approved: boolean; created_at: string; }
interface GalleryItem { id: number; url: string; caption: string; category: string; }
interface DbPromo { id: number; title: string; description: string; image_url: string; discount_text: string; is_active: boolean; sort_order: number; }

// ── Static data ────────────────────────────────────────────────────────────────
const FEATURED_DISHES: MenuItem[] = [
  { id: 1, name: 'Шашлык из баранины', description: 'Сочная баранина с мангала. Подаётся с лавашом и гранатовым соусом.', price: 890, category: 'Шашлык', image_url: '', calories: 420, cook_time: 25 },
  { id: 2, name: 'Люля-кебаб', description: 'Ароматный люля с зеленью и печёным помидором.', price: 690, category: 'Шашлык', image_url: '', calories: 380, cook_time: 20, is_special: true },
  { id: 3, name: 'Плов по-фергански', description: 'Рассыпчатый плов из баранины в казане.', price: 750, category: 'Горячее', image_url: '', calories: 550, cook_time: 30 },
  { id: 4, name: 'Хачапури по-аджарски', description: 'С сулугуни, маслом и яйцом.', price: 520, category: 'Выпечка', image_url: '', calories: 340, cook_time: 20 },
  { id: 5, name: 'Шаурма из баранины', description: 'С овощами и фирменным соусом.', price: 580, category: 'Шашлык', image_url: '', calories: 460, cook_time: 15 },
  { id: 6, name: 'Салат с телятиной', description: 'Тёплый салат гриль с рукколой и пармезаном.', price: 490, category: 'Салаты', image_url: '', calories: 280, cook_time: 15 },
  { id: 7, name: 'Суп харчо', description: 'Наваристый суп с рисом и кинзой.', price: 420, category: 'Супы', image_url: '', calories: 310, cook_time: 25 },
  { id: 8, name: 'Чай с травами', description: 'Горный сбор с чабрецом и мятой.', price: 250, category: 'Напитки', image_url: '', calories: 0 },
];

const PROMOS_FALLBACK = [
  { id: 1, title: 'День рождения', description: 'Скидка 10% на всё меню при предъявлении паспорта', discount_text: '-10%', image_url: '', is_active: true, sort_order: 0 },
  { id: 2, title: '2+1 Коктейли', description: 'Третий коктейль в подарок — любые из бара', discount_text: 'Подарок', image_url: '', is_active: true, sort_order: 1 },
  { id: 3, title: 'Фруктовая тарелка', description: 'В подарок при заказе от 10 000 ₽ для банкетов', discount_text: 'Gift', image_url: '', is_active: true, sort_order: 2 },
];

const GALLERY_FALLBACK: GalleryItem[] = [
  { id: 1, url: '/images/gallery-1.jpg', caption: 'Атмосфера ресторана', category: 'interior' },
  { id: 2, url: '/images/gallery-2.jpg', caption: 'Наша кухня', category: 'kitchen' },
  { id: 3, url: '/images/gallery-3.jpg', caption: 'Шашлык на мангале', category: 'food' },
  { id: 4, url: '/images/gallery-4.jpg', caption: 'Уютный зал', category: 'interior' },
  { id: 5, url: '/images/gallery-5.jpg', caption: 'Банкетный зал', category: 'interior' },
  { id: 6, url: '/images/gallery-6.jpg', caption: 'Наши блюда', category: 'food' },
];

const TICKER_ITEMS = [
  'Шашлык из баранины', 'Рейтинг 4.8 на Яндекс', 'Банкеты от 4 000 ₽',
  'Доставка за 40 минут', 'Плов по-фергански', 'Хачапури по-аджарски',
  'Живая музыка', 'Корпоративы и свадьбы', 'Открыто ежедневно с 09:00', 'МЦД Сходня',
];

const BENEFITS = [
  { icon: ChefHat, title: 'Авторская кухня', desc: 'Шеф-повар с 15-летним стажем', color: 'from-amber-500 to-orange-500' },
  { icon: Heart, title: 'Живая музыка', desc: 'По пятницам и выходным', color: 'from-rose-500 to-pink-500' },
  { icon: Shield, title: 'Свежие продукты', desc: 'От фермеров ежедневно', color: 'from-green-500 to-emerald-500' },
  { icon: Users, title: 'До 200 гостей', desc: 'Банкеты любого масштаба', color: 'from-blue-500 to-indigo-500' },
];

const BANQUET_SERVICES = [
  { icon: Users, title: 'Фуршет', desc: 'Закуски и канапе' },
  { icon: Sparkles, title: 'Банкет', desc: 'Горячее и мангал' },
  { icon: Wine, title: 'Бар', desc: 'Коктейли и вина' },
  { icon: Music, title: 'Музыка', desc: 'DJ и живой звук' },
  { icon: Camera, title: 'Фото', desc: 'Фотограф на праздник' },
  { icon: ChefHat, title: 'Кейтеринг', desc: 'Выезд с мангалом' },
];

const PROMO_ICONS = [Gift, Star, Zap, Sparkles, Trophy, Heart];

// ── Utility components ─────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 90 + i * 55, height: 90 + i * 55,
            left: `${4 + i * 13}%`, top: `${8 + (i % 4) * 20}%`,
            background: i % 3 === 0
              ? 'radial-gradient(circle, rgba(232,98,26,0.18) 0%, transparent 70%)'
              : i % 3 === 1
              ? 'radial-gradient(circle, rgba(255,175,60,0.09) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(200,70,20,0.07) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -(28 + i * 9), 0], opacity: [0.35, 0.65, 0.35], scale: [1, 1.13, 1] }}
          transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
        />
      ))}
    </div>
  );
}

function MarqueeTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/[0.05] bg-black/50 py-3 select-none">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-sp-cream/40 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sp-orange/50 flex-shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function AnimatedCounter({ from = 0, to, suffix = '', label }: { from?: number; to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(from);
  const isVisible = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isVisible) return;
    const start = Date.now();
    const dur = 1800;
    let raf: number;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setVal(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, from, to]);

  return (
    <div ref={ref} className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all">
      <div className="font-bold text-3xl md:text-4xl tabular-nums text-sp-cream">{val}{suffix}</div>
      <div className="text-sp-cream/40 text-xs mt-2 uppercase tracking-[0.15em]">{label}</div>
    </div>
  );
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration: 0.75, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const itemVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as any } },
};

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [gallery, setGallery] = useState<GalleryItem[]>(GALLERY_FALLBACK);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [promos, setPromos] = useState<DbPromo[]>(PROMOS_FALLBACK as DbPromo[]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const heroBgScale = useTransform(scrollY, [0, 700], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 480], [1, 0.08]);

  useEffect(() => {
    getGallery().then((g: any) => { if (g?.length) setGallery(g.slice(0, 6)); }).catch(() => {});
    getReviews().then((r: any) => { if (r?.length) setReviews(r.filter((x: Review) => x.approved).slice(0, 3)); }).catch(() => {});
    getPromotions().then((p: any) => { if (p?.length) setPromos(p.filter((x: any) => x.is_active !== false)); }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-sp-darkest">
      <title>Соль и Перец — Ресторан в Сходне | Шашлык, Плов, Банкеты от 4 000 ₽</title>
      <meta name="description" content="Ресторан «Соль и Перец» в Сходне. Шашлык из баранины, плов, хачапури, банкеты. Доставка, бронирование. Работаем ежедневно с 09:00." />
      <meta property="og:title" content="Соль и Перец — Ресторан в Сходне" />
      <meta property="og:description" content="Шашлык на мангале, плов, хачапури. Банкеты от 4 000 ₽. Доставка за 40 минут." />
      <meta property="og:image" content="/images/hero-bg.jpg" />
      <link rel="canonical" href="https://sol-i-perets.ru" />

      {/* ════════════════════════ HERO ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background layers */}
        <motion.div style={{ scale: heroBgScale }} className="absolute inset-0">
          {/* Photo — 45% so atmosphere is visible but text stays readable */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/hero-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.45,
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-sp-darkest" />
          <div className="absolute inset-0 bg-gradient-to-r from-sp-darkest/35 via-transparent to-sp-darkest/25" />
          {/* Pulsing warm glow */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 28% 50%, rgba(232,98,26,0.24) 0%, transparent 52%), radial-gradient(ellipse at 75% 30%, rgba(255,165,50,0.11) 0%, transparent 44%)' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <FloatingOrbs />

        {/* Rating badge — top right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1, ease: 'easeOut' }}
          className="absolute top-24 right-5 md:right-10 z-20 hidden sm:block"
        >
          <div className="bg-black/55 backdrop-blur-xl border border-white/12 rounded-2xl px-4 py-3 text-center shadow-2xl shadow-black/50">
            <div className="flex justify-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} className="text-yellow-500 fill-yellow-500" />)}
            </div>
            <div className="text-sp-cream font-bold text-xl leading-none">4.8</div>
            <div className="text-sp-cream/40 text-[10px] mt-1 uppercase tracking-wider">100+ отзывов</div>
          </div>
        </motion.div>

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Status badge */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-md border border-white/10 text-sp-cream/65 text-xs px-5 py-2.5 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-semibold">Открыто</span>
              <span className="w-px h-3 bg-white/20" />
              <MapPin size={11} className="text-sp-orange" />
              МЦД Сходня · ул. Некрасова 15
            </span>
          </motion.div>

          {/* Title in Playfair Display */}
          <motion.h1
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-5 leading-none"
          >
            <span className="block font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight">
              <span className="text-sp-cream">Соль</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sp-orange to-red-400"> &amp; </span>
              <span className="text-sp-cream">Перец</span>
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-sp-cream/55 text-lg md:text-xl mb-7 max-w-xl mx-auto leading-relaxed"
          >
            Настоящий шашлык на углях, авторская кухня<br className="hidden md:block" />
            и живая атмосфера в Сходне
          </motion.p>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {['Шашлык', 'Мангал', 'Плов', 'Банкеты', 'Доставка'].map(tag => (
              <span
                key={tag}
                className="px-3.5 py-1.5 text-xs bg-white/6 border border-white/8 rounded-full text-sp-cream/45 hover:text-sp-cream hover:border-sp-orange/25 transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/menu"
              className="group relative inline-flex items-center justify-center gap-2.5 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-9 py-4 rounded-full text-base transition-all shadow-2xl shadow-sp-orange/30 hover:shadow-sp-orange/50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Flame size={18} />
              Смотреть меню
            </Link>
            <Link
              to="/reserve"
              className="inline-flex items-center justify-center gap-2.5 border border-white/22 hover:border-sp-orange/40 text-sp-cream font-semibold px-9 py-4 rounded-full text-base transition-all hover:bg-sp-orange/10 backdrop-blur-sm"
            >
              <Sparkles size={18} />
              Забронировать стол
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll mouse indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sp-cream/25 pointer-events-none">
          <div className="w-5 h-8 border border-white/15 rounded-full flex items-start justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 bg-white/40 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em]">Листайте</span>
        </div>
      </section>

      {/* ════════════════════════ TICKER ══════════════════════════════════════ */}
      <MarqueeTicker />

      {/* ════════════════════════ STATS ═══════════════════════════════════════ */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AnimatedCounter to={150} suffix="+" label="Блюд в меню" />
            <AnimatedCounter to={5} suffix=" лет" label="Радуем гостей" />
            <AnimatedCounter to={100} suffix="+" label="Отзывов" />
            <AnimatedCounter to={200} suffix="" label="Мест в зале" />
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY US — BENTO ══════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sp-orange/3 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <RevealSection className="text-center mb-12">
            <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Почему выбирают нас</span>
            <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-2">Больше, чем просто еда</h2>
          </RevealSection>

          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Hero bento card — spans 2 cols */}
            <motion.div
              variants={itemVariant}
              className="col-span-2 relative overflow-hidden rounded-3xl min-h-[200px] flex flex-col justify-end group cursor-default"
            >
              <div
                className="absolute inset-0"
                style={{ backgroundImage: 'url(/images/dish-grill.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:from-black/75 transition-all duration-500" />
              <div className="relative p-6 md:p-8">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 text-white shadow-lg shadow-orange-500/30">
                  <Flame size={22} />
                </div>
                <h3 className="text-white font-bold text-xl mb-1.5">Мангал круглый год</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                  Шашлык на живых углях в любую погоду — это наша гордость и особенность
                </p>
              </div>
            </motion.div>

            {/* Normal bento cards */}
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariant}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-3 text-white shadow-lg`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sp-cream font-bold text-sm mb-1">{b.title}</h3>
                  <p className="text-sp-cream/45 text-xs leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}

            {/* Trophy card — wide */}
            <motion.div
              variants={itemVariant}
              whileHover={{ y: -4 }}
              className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/15 hover:border-yellow-500/25 transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mb-3 text-white shadow-lg">
                <Trophy size={20} />
              </div>
              <h3 className="text-sp-cream font-bold text-sm mb-1">Рейтинг 4.8 ★</h3>
              <p className="text-sp-cream/45 text-xs leading-relaxed">100+ отзывов на Яндекс.Картах</p>
            </motion.div>
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ POPULAR DISHES ══════════════════════════════ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Популярное</span>
                <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-1">Нас выбирают</h2>
              </div>
              <Link to="/menu" className="hidden md:inline-flex items-center gap-1.5 text-sp-orange hover:text-sp-orange/80 text-sm font-medium transition-colors">
                Всё меню <ArrowRight size={14} />
              </Link>
            </div>
          </RevealSection>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {FEATURED_DISHES.map(item => (
              <motion.div key={item.id} variants={itemVariant}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </StaggerChildren>
          <RevealSection delay={0.3} className="text-center mt-8">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-sp-orange/25 text-sp-cream font-medium px-8 py-3.5 rounded-full text-sm transition-all"
            >
              Смотреть полное меню <ArrowRight size={14} />
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════════ DELIVERY ════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/dish-grill.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-sp-darkest via-sp-darkest/96 to-sp-darkest/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-sp-darkest/50 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg shadow-sp-orange/25">
                  <Zap size={13} /> Доставка за 40 минут
                </div>
                <h2 className="font-display font-bold text-sp-cream text-3xl md:text-5xl mb-4 leading-tight">
                  Шашлык горячим<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-sp-orange">прямо к вам домой</span>
                </h2>
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { icon: Bike, label: '40 мин — среднее время' },
                    { icon: Gift, label: 'Бесплатно от 1 500 ₽' },
                    { icon: Flame, label: 'В термосумке — горячим' },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2 text-sp-cream/55 text-sm bg-black/35 backdrop-blur px-3.5 py-2 rounded-full border border-white/6">
                      <Icon size={15} className="text-sp-orange" />
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/menu"
                    className="inline-flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-8 py-4 rounded-full transition-all shadow-xl shadow-sp-orange/25 hover:shadow-sp-orange/40"
                  >
                    <ShoppingBag size={18} /> Заказать доставку
                  </Link>
                  <a
                    href="tel:+79055471640"
                    className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/35 text-sp-cream font-medium px-8 py-4 rounded-full transition-all hover:bg-white/5 backdrop-blur-sm"
                  >
                    <Phone size={18} /> Позвонить
                  </a>
                </div>
              </div>

              <div className="hidden md:flex justify-center">
                <div className="bg-gradient-to-br from-amber-500/10 via-sp-orange/6 to-transparent rounded-3xl border border-amber-500/15 p-8 text-center backdrop-blur-sm max-w-xs w-full">
                  <div className="text-7xl mb-5 select-none" aria-hidden="true">🏍️</div>
                  <div className="bg-black/40 backdrop-blur rounded-2xl border border-white/8 p-5">
                    <div className="text-sp-orange font-bold text-3xl">Бесплатно</div>
                    <div className="text-sp-cream/40 text-sm mt-1">при заказе от 1 500 ₽</div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sp-cream/50 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Работаем ежедневно
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════════ GALLERY ═════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection className="text-center mb-10">
            <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Галерея</span>
            <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-2">Атмосфера и кухня</h2>
          </RevealSection>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((img, i) => (
              <motion.div
                key={img.id}
                variants={itemVariant}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLightbox(img.url)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''} aspect-square`}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  width={i === 0 ? 800 : 400}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-medium">{img.caption}</span>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/96 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.88 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt=""
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              aria-label="Закрыть"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all"
            >
              ✕
            </button>
          </motion.div>
        )}
      </section>

      {/* ════════════════════════ BANQUET ═════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/images/banquet.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-sp-darkest via-sp-darkest/95 to-sp-darkest/70" />
        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-lg shadow-sp-orange/20">
                <Sparkles size={13} /> Банкеты и мероприятия
              </div>
              <h2 className="font-display font-bold text-sp-cream text-3xl md:text-5xl mb-3 leading-tight">
                Ваш праздник —<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-sp-orange">наша забота</span>
              </h2>
              <p className="text-sp-cream/50 mb-2 text-sm leading-relaxed max-w-md">
                Организуем мероприятие под ключ для 10–200 человек.
              </p>
              {/* Price anchor — marketing psychology: anchor high value first */}
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-sp-orange font-bold text-2xl">от 4 000 ₽</span>
                <span className="text-sp-cream/40 text-sm">на человека</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
                {BANQUET_SERVICES.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-black/30 backdrop-blur border border-white/6 hover:border-white/12 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/12 flex items-center justify-center mb-2 text-amber-400">
                        <Icon size={18} />
                      </div>
                      <h4 className="text-sp-cream font-semibold text-xs mb-0.5">{s.title}</h4>
                      <p className="text-sp-cream/40 text-[10px] leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/banquet"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white font-bold px-8 py-4 rounded-full transition-all shadow-xl shadow-sp-orange/20 hover:shadow-sp-orange/35"
                >
                  <Sparkles size={18} /> Заказать банкет
                </Link>
                <a
                  href="tel:+79055471640"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/35 text-sp-cream font-medium px-8 py-4 rounded-full transition-all hover:bg-white/5 backdrop-blur-sm"
                >
                  <Phone size={18} /> Позвонить
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════════ PROMOS ══════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-sp-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-sp-orange/4 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <RevealSection className="text-center mb-10">
            <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Акции</span>
            <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-2">Специальные предложения</h2>
          </RevealSection>
          <StaggerChildren className="grid md:grid-cols-3 gap-4">
            {promos.slice(0, 3).map((p, i) => {
              const Icon = PROMO_ICONS[i % PROMO_ICONS.length];
              const badge = p.discount_text || (p as any).tag || '';
              const desc = p.description || (p as any).desc || (p as any).detail || '';
              return (
                <motion.div
                  key={p.id}
                  variants={itemVariant}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.07] p-6 hover:border-sp-orange/20 transition-all"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-sp-orange/6 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-sp-orange/15 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
                      <Icon size={20} />
                    </div>
                    {badge && (
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-sp-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg shadow-sp-orange/20">
                        {badge}
                      </div>
                    )}
                    <h3 className="text-sp-cream font-bold text-lg mb-2">{p.title}</h3>
                    {desc && <p className="text-sp-cream/50 text-sm leading-relaxed">{desc}</p>}
                  </div>
                </motion.div>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════════ REVIEWS ═════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url(/images/interior.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="container mx-auto px-4 relative">
          <RevealSection className="text-center mb-10">
            <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Отзывы</span>
            <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-2">Что говорят гости</h2>
          </RevealSection>

          {reviews.length > 0 ? (
            <StaggerChildren className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {reviews.map(r => (
                <motion.div
                  key={r.id}
                  variants={itemVariant}
                  className="relative bg-white/[0.04] backdrop-blur border border-white/8 rounded-3xl p-6 hover:border-white/14 transition-all"
                >
                  {/* Decorative large quote */}
                  <div className="absolute -top-2 left-5 font-display text-8xl text-sp-orange/15 leading-none select-none pointer-events-none" aria-hidden="true">"</div>
                  <div className="flex items-center gap-1 mb-3 relative">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={13} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sp-cream/65 text-sm leading-relaxed mb-5 relative line-clamp-4">«{r.text}»</p>
                  <div className="flex items-center gap-2.5 relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-sp-orange flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sp-cream/45 text-sm">{r.author_name}</span>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          ) : (
            <RevealSection className="flex justify-center">
              <div className="bg-white/[0.04] backdrop-blur border border-white/8 rounded-3xl p-8 text-center max-w-sm w-full">
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={22} className="text-yellow-500 fill-yellow-500" />)}
                </div>
                <div className="text-sp-cream font-bold text-4xl mb-1">4.8</div>
                <div className="text-sp-cream/40 text-sm mb-5">Яндекс.Карты — более 100 отзывов</div>
                <a
                  href="https://yandex.ru/maps/org/sol_i_perets/172085958854/reviews/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/20"
                >
                  <Star size={15} /> Читать отзывы
                </a>
              </div>
            </RevealSection>
          )}

          {reviews.length > 0 && (
            <RevealSection delay={0.3} className="text-center mt-8">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-sp-orange/25 text-sp-cream font-medium px-8 py-3.5 rounded-full text-sm transition-all"
              >
                Все отзывы <ArrowRight size={14} />
              </Link>
            </RevealSection>
          )}
        </div>
      </section>

      {/* ════════════════════════ CONTACTS ════════════════════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection className="text-center mb-10">
            <span className="text-sp-orange text-xs font-bold uppercase tracking-[0.25em]">Контакты</span>
            <h2 className="font-display font-bold text-sp-cream text-3xl md:text-4xl mt-2">Как нас найти</h2>
          </RevealSection>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {[
                { icon: MapPin, title: 'Адрес', text: 'Химки, ул. Некрасова 15', sub: 'Рядом МЦД Сходня', href: undefined as string | undefined },
                { icon: Phone, title: 'Телефон', text: '+7 (905) 547-16-40', sub: 'Звонки и WhatsApp', href: 'tel:+79055471640' },
                { icon: Clock, title: 'Часы работы', text: 'Пн–Пт: 09:00–01:00', sub: 'Сб–Вс: 09:00–05:00', href: undefined },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <RevealSection key={i} delay={i * 0.1}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-sp-orange/10 flex items-center justify-center text-sp-orange flex-shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sp-cream/40 text-xs uppercase tracking-wider mb-0.5">{c.title}</div>
                        <div className="text-sp-cream font-semibold text-sm">
                          {c.href
                            ? <a href={c.href} className="hover:text-sp-orange transition-colors">{c.text}</a>
                            : c.text}
                        </div>
                        <div className="text-sp-cream/35 text-xs mt-0.5">{c.sub}</div>
                      </div>
                    </div>
                  </RevealSection>
                );
              })}
              <RevealSection delay={0.4}>
                <a
                  href="tel:+79055471640"
                  className="flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/20"
                >
                  <Phone size={15} /> Позвонить сейчас
                </a>
              </RevealSection>
            </div>
            <RevealSection delay={0.2} className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden border border-white/8 h-72 md:h-full min-h-[288px] shadow-2xl shadow-black/40">
                <iframe
                  src="https://yandex.ru/map-widget/v1/org/sol_i_perets/172085958854/?ll=37.282959%2C55.944047&z=16"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Карта ресторана Соль и Перец"
                  className="grayscale-[40%]"
                  loading="lazy"
                />
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FINAL CTA ═══════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-sp-orange to-red-700" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(255,200,80,0.25) 0%, transparent 60%)',
              'radial-gradient(ellipse at 80% 50%, rgba(255,200,80,0.25) 0%, transparent 60%)',
              'radial-gradient(ellipse at 20% 50%, rgba(255,200,80,0.25) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto px-4 text-center"
        >
          <h2 className="font-display font-bold text-white text-4xl md:text-6xl mb-4 leading-tight">
            Готовы попробовать?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-md mx-auto">
            Ждём вас ежедневно с 09:00 — мангал уже горит
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reserve"
              className="inline-flex items-center justify-center gap-2.5 bg-white text-sp-orange font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-sp-cream hover:scale-105 shadow-2xl"
            >
              <Sparkles size={18} /> Забронировать стол
            </Link>
            <a
              href="tel:+79055471640"
              className="inline-flex items-center justify-center gap-2.5 border-2 border-white/40 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-white/10 hover:border-white/60"
            >
              <Phone size={18} /> +7 (905) 547-16-40
            </a>
          </div>
        </motion.div>
      </section>

      {/* Schema.org structured data */}
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Соль и Перец',
        url: 'https://sol-i-perets.ru',
        telephone: '+79055471640',
        address: { '@type': 'PostalAddress', streetAddress: 'ул. Некрасова 15', addressLocality: 'Химки', addressRegion: 'Московская обл.', addressCountry: 'RU' },
        servesCuisine: ['Russian', 'Caucasian', 'Grill'],
        priceRange: '₽₽',
        openingHours: ['Mo-Fr 09:00-01:00', 'Sa-Su 09:00-05:00'],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '100' },
      })}</script>
    </div>
  );
}
