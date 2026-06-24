import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Star, Clock, Users, Flame, MapPin, Phone, Shield, Trophy, Sparkles, ChefHat, Wine, Music, Camera, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import MenuCard, { type MenuItem } from '../components/MenuCard';
import { cartStore } from '../lib/cart';
import { getMenuItems, getPromotions, getGallery } from '../lib/db';

interface Promo { id: number; title: string; description: string; discount_text: string; expires_at: string; }
interface GalleryItem { id: number; url: string; caption: string; }

function Countdown({ target }: { target: string }) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      setT({ h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60 });
    };
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return (
    <div className="flex gap-2">
      {[['ч', t.h], ['м', t.m], ['с', t.s]].map(([l, v]) => (
        <div key={l as string} className="flex flex-col items-center">
          <div className="bg-black/30 backdrop-blur rounded-lg px-2 py-1 font-mono font-bold text-sp-orange text-lg min-w-[36px] text-center">{String(v).padStart(2, '0')}</div>
          <span className="text-white/40 text-xs mt-0.5">{l}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: 60 + i * 40,
            height: 60 + i * 40,
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 4) * 20}%`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(232,98,26,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,200,100,0.08) 0%, transparent 70%)',
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
            scale: [1, 1.1, 1, 1.05, 1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}

function AnimatedCounter({ from = 0, to, suffix = '', label }: { from?: number; to: number; suffix?: string; label: string }) {
  const ref = { current: null as null | HTMLDivElement };
  const [val, setVal] = useState(from);
  const isVisible = useInView(ref as any, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isVisible) return;
    const end = to;
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (end - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, from, to]);

  return (
    <div ref={ref as any} className="text-center">
      <div className="text-sp-cream font-bold text-3xl md:text-4xl tabular-nums">{val}{suffix}</div>
      <div className="text-sp-cream/40 text-sm mt-1">{label}</div>
    </div>
  );
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = { current: null as null | HTMLDivElement };
  const isVisible = useInView(ref as any, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref as any}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = { current: null as null | HTMLDivElement };
  const isVisible = useInView(ref as any, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function Home() {
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [special, setSpecial] = useState<MenuItem | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);

  useEffect(() => {
    Promise.all([
      getMenuItems({ bar: false }),
      getPromotions(),
      getGallery(),
    ]).then(([menu, p, g]) => {
      const sp = (menu as MenuItem[]).find(d => d.is_special);
      if (sp) setSpecial(sp);
      setFeatured((menu as MenuItem[]).filter(d => !d.is_special).slice(0, 8));
      setPromos(p as Promo[]);
      setGallery((g as GalleryItem[]).slice(0, 8));
    }).catch(console.error);
  }, []);

  const benefits = [
    { icon: <Flame size={24} />, title: 'Мангал круглый год', desc: 'Настоящий шашлык на древесных углях — в любую погоду', color: 'from-orange-500 to-red-500' },
    { icon: <ChefHat size={24} />, title: 'Авторская кухня', desc: 'Шеф-повар с 15-летним стажем создаёт уникальные рецепты', color: 'from-amber-500 to-orange-500' },
    { icon: <Heart size={24} />, title: 'Домашний уют', desc: 'Тёплая атмосфера, приглушённый свет и живая музыка по пятницам', color: 'from-rose-500 to-pink-500' },
    { icon: <Shield size={24} />, title: 'Свежесть продуктов', desc: 'Ежедневные поставки от местных фермеров — никаких полуфабрикатов', color: 'from-green-500 to-emerald-500' },
    { icon: <Users size={24} />, title: 'Любое мероприятие', desc: 'Дни рождения, корпоративы, свадьбы, поминки — организуем под ключ', color: 'from-blue-500 to-indigo-500' },
    { icon: <Trophy size={24} />, title: 'Рейтинг 4.8 ★', desc: 'Более 100 положительных отзывов на Яндекс.Картах', color: 'from-yellow-500 to-amber-500' },
  ];

  const banquetServices = [
    { icon: <Users size={22} />, title: 'Фуршет', desc: 'Лёгкие закуски, канапе, напитки — идеально для деловых встреч' },
    { icon: <Sparkles size={22} />, title: 'Банкетное меню', desc: 'Горячие блюда, салаты, закуски, мангал — от 4 000 ₽/чел.' },
    { icon: <Wine size={22} />, title: 'Барное обслуживание', desc: 'Авторские коктейли, пиво, винная карта, безалкогольное меню' },
    { icon: <Music size={22} />, title: 'Музыка и ведущий', desc: 'Живая музыка, караоке, DJ, профессиональный ведущий под ключ' },
    { icon: <Camera size={22} />, title: 'Фото и видео', desc: 'Фотограф на мероприятие, видеосъёмка, фото-зона с реквизитом' },
    { icon: <ChefHat size={22} />, title: 'Кейтеринг', desc: 'Выездное обслуживание с мангалом — проведём праздник у вас' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-sp-darkest">
      <title>Соль и Перец — Кафе в Сходне | Шашлык, Плов, Банкеты</title>
      <meta name="description" content="Кафе Соль и Перец — вкусная домашняя кухня в Сходне. Шашлык, плов, гриль, банкеты от 4 000 ₽. Доставка, бронирование столов. ул. Некрасова 15." />
      <meta property="og:title" content="Соль и Перец — Кафе в Сходне" />
      <meta property="og:description" content="Домашняя кухня и уютная атмосфера. Шашлык, плов, гриль, банкеты от 4 000 ₽." />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sp-darkest/70 via-sp-darkest/50 to-sp-darkest" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-amber-900/10" />
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, rgba(232,98,26,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(255,200,100,0.15) 0%, transparent 50%)',
            }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23E8621A\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />
        </motion.div>

        <FloatingOrbs />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-sp-cream/70 text-sm px-4 py-2 rounded-full mb-8">
              <MapPin size={13} className="text-sp-orange" />
              МЦД Сходня · ул. Некрасова 15
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400/70">Работаем</span>
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="mb-6">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="text-sp-cream">Соль</span>
              <span className="text-sp-orange mx-2">&amp;</span>
              <span className="text-sp-cream">Перец</span>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-sp-cream/60 text-lg md:text-xl mb-4 max-w-2xl mx-auto font-light leading-relaxed">
            Ресторан домашней кухни в Сходне
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {['Шашлык', 'Мангал', 'Плов', 'Банкеты'].map(tag => (
              <span key={tag} className="px-4 py-1.5 text-sm bg-white/5 border border-white/10 rounded-full text-sp-cream/50 hover:text-sp-cream hover:border-sp-orange/30 transition-all cursor-default">
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="group relative inline-flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-sp-orange/25 hover:shadow-sp-orange/40 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Flame size={18} />
              Смотреть меню
            </Link>
            <Link to="/reserve" className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-sp-cream font-bold px-8 py-4 rounded-full text-base transition-all hover:bg-white/5 backdrop-blur-sm">
              <Sparkles size={18} />
              Забронировать стол
            </Link>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sp-cream/20">
          <span className="text-xs">Листайте</span>
          <ArrowRight size={16} className="rotate-90" />
        </motion.div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="py-14 border-y border-white/5 bg-sp-darkest/80 backdrop-blur sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter from={0} to={150} suffix="+" label="Блюд в меню" />
            <AnimatedCounter from={0} to={5} suffix=" лет" label="Радуем гостей" />
            <AnimatedCounter from={0} to={100} suffix="+" label="Отзывов на Яндекс" />
            <AnimatedCounter from={0} to={200} suffix="" label="Гостей вмещает зал" />
          </div>
        </div>
      </section>

      {/* ════════════════════ WHY US ════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sp-orange/3 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Почему выбирают нас</span>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-4 leading-tight">Больше, чем просто еда</h2>
              <p className="text-sp-cream/40 mt-3 max-w-xl mx-auto">Мы создаём атмосферу, в которой хочется возвращаться снова и снова</p>
            </div>
          </RevealSection>

          <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -4 }} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} bg-opacity-10 flex items-center justify-center mb-4 text-white shadow-lg`}>
                  {b.icon}
                </div>
                <h3 className="text-sp-cream font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sp-cream/50 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ════════════════════ SPECIAL DISH ════════════════════ */}
      {special && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-orange-900/5" />
          <div className="container mx-auto px-4 relative z-10">
            <RevealSection>
              <motion.div className="relative bg-gradient-to-br from-amber-500/5 via-sp-dark to-orange-500/5 rounded-3xl border border-amber-500/10 p-8 md:p-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sp-orange/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white text-sm font-bold px-4 py-2 rounded-full mb-5">
                      <Sparkles size={14} />
                      Блюдо дня
                    </div>
                    <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mb-4 leading-tight">{special.name}</h2>
                    <p className="text-sp-cream/50 leading-relaxed mb-6 max-w-lg">{special.description}</p>
                    <div className="flex items-center gap-4 mb-8">
                      {special.original_price && (
                        <span className="text-sp-cream/30 text-lg line-through">{special.original_price.toLocaleString('ru-RU')} ₽</span>
                      )}
                      <span className="text-sp-orange font-bold text-5xl tracking-tight">{special.price.toLocaleString('ru-RU')} ₽</span>
                      {special.original_price && (
                        <span className="bg-red-500/15 text-red-400 text-sm font-bold px-3 py-1 rounded-full">
                          -{Math.round((1 - special.price / special.original_price) * 100)}%
                        </span>
                      )}
                    </div>
                    <button onClick={() => cartStore.add({ id: special.id, name: special.name, price: special.price, image_url: '' })}
                      className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-8 py-3.5 rounded-full text-base transition-all shadow-lg shadow-sp-orange/20">
                      <Flame size={18} />
                      Заказать
                    </button>
                  </div>
                  <div className="hidden md:flex flex-shrink-0 items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-sp-orange/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/15 to-sp-orange/10 border-2 border-amber-500/20 flex items-center justify-center">
                      <span className="text-7xl">🍽️</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </RevealSection>
          </div>
        </section>
      )}

      {/* ════════════════════ POPULAR ════════════════════ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Популярное</span>
                <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Нас выбирают</h2>
              </div>
              <Link to="/menu" className="hidden md:inline-flex items-center gap-1 text-sp-orange hover:text-sp-orange/80 text-sm font-medium transition-colors">
                Всё меню <ArrowRight size={14} />
              </Link>
            </div>
          </RevealSection>

          <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((item) => (
              <motion.div key={item.id} variants={staggerItem}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </StaggerChildren>

          <RevealSection delay={0.3}>
            <div className="text-center mt-12">
              <Link to="/menu" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sp-orange/30 text-sp-cream font-medium px-8 py-3.5 rounded-full text-sm transition-all">
                Смотреть полное меню
                <ArrowRight size={14} />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════ PROMOS ════════════════════ */}
      {promos.length > 0 && (
        <section className="py-20 bg-sp-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-sp-dark via-transparent to-sp-dark" />
          <div className="container mx-auto px-4 relative">
            <RevealSection>
              <div className="text-center mb-12">
                <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Не упустите</span>
                <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Действующие акции</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {promos.map(p => (
                  <motion.div key={p.id} whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] p-6 hover:border-sp-orange/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sp-orange/5 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="inline-block bg-gradient-to-r from-amber-500 to-sp-orange text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
                        {p.discount_text}
                      </div>
                      <h3 className="text-sp-cream font-bold text-xl mb-2">{p.title}</h3>
                      <p className="text-sp-cream/50 text-sm mb-4 leading-relaxed">{p.description}</p>
                      {p.expires_at && (
                        <>
                          <div className="text-sp-cream/30 text-xs mb-1.5">До конца акции:</div>
                          <Countdown target={p.expires_at} />
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>
      )}

      {/* ════════════════════ GALLERY ════════════════════ */}
      {gallery.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <RevealSection>
              <div className="text-center mb-12">
                <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Галерея</span>
                <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Атмосфера и кухня</h2>
              </div>
              <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <motion.div
                    key={img.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setLightbox(img.url)}
                    className={`relative overflow-hidden rounded-2xl cursor-pointer group aspect-square ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                  >
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-medium">{img.caption}</span>
                    </div>
                  </motion.div>
                ))}
              </StaggerChildren>
            </RevealSection>
          </div>
          {lightbox && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightbox(null)}>
              <motion.img initial={{ scale: 0.85 }} animate={{ scale: 1 }} src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all">✕</button>
            </motion.div>
          )}
        </section>
      )}

      {/* ════════════════════ BANQUET ════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sp-dark via-sp-darkest to-sp-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/5 to-sp-orange/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="text-center mb-5">
              <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Банкеты и мероприятия</span>
              <h2 className="text-sp-cream font-bold text-3xl md:text-5xl mt-4 leading-tight">Ваш праздник — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-sp-orange">наша забота</span></h2>
              <p className="text-sp-cream/40 mt-4 max-w-2xl mx-auto">Организуем мероприятие под ключ: от фуршета до свадебного банкета. Вместимость до 200 человек.</p>
            </div>

            <div className="mt-8 bg-gradient-to-br from-amber-500/5 via-white/[0.02] to-sp-orange/5 rounded-3xl border border-amber-500/10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                  <div className="text-4xl font-bold text-sp-cream mb-1">от 4 000 ₽</div>
                  <div className="text-sp-cream/40 text-sm">до 6 000 ₽ на человека</div>
                </div>
                <div className="md:text-right">
                  <div className="inline-flex items-center gap-2 text-sp-cream/60 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <CheckCircle2 size={14} className="text-green-400" />
                    Индивидуальный подбор меню
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {banquetServices.map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 hover:bg-amber-500/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 text-amber-400">
                      {s.icon}
                    </div>
                    <h4 className="text-sp-cream font-semibold text-sm mb-1">{s.title}</h4>
                    <p className="text-sp-cream/40 text-xs leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/banquet" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-sp-orange/20 hover:shadow-sp-orange/30">
                  <Sparkles size={18} />
                  Заказать банкет
                </Link>
                <Link to="/menu" className="inline-flex items-center justify-center gap-2 border-2 border-white/15 hover:border-white/30 text-sp-cream font-medium px-8 py-4 rounded-full text-base transition-all">
                  Смотреть меню
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════ REVIEWS ════════════════════ */}
      <section className="py-20 bg-sp-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/3 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <RevealSection>
            <motion.div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={28} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mb-3">Нас ценят гости</h2>
              <p className="text-sp-cream/50 mb-8 max-w-md mx-auto">Более 100 отзывов на Яндекс.Картах с оценкой 4.8 — приходите и убедитесь сами!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://yandex.ru/maps/org/sol_i_perets/172085958854/reviews/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/20">
                  <Star size={16} />
                  Читать отзывы
                </a>
                <Link to="/reviews"
                  className="inline-flex items-center gap-2 border-2 border-white/15 hover:border-white/30 text-sp-cream font-medium px-6 py-3 rounded-full text-sm transition-all">
                  Все отзывы
                </Link>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════ MAP + CONTACTS ════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-12">
              <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Контакты</span>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Как нас найти</h2>
            </div>
          </RevealSection>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[
                { icon: <MapPin size={18} />, title: 'Адрес', text: 'Московская обл., Химки, ул. Некрасова 15', sub: 'Рядом МЦД Сходня' },
                { icon: <Phone size={18} />, title: 'Телефон', text: '+7 (905) 547-16-40', sub: 'Звонки и WhatsApp', href: 'tel:+79055471640' },
                { icon: <Clock size={18} />, title: 'Часы работы', text: 'Пн–Пт: 09:00 – 01:00', sub: 'Сб–Вс: 09:00 – 05:00' },
              ].map((c, i) => (
                <RevealSection key={i} delay={i * 0.1}>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-sp-orange/10 flex items-center justify-center text-sp-orange flex-shrink-0">{c.icon}</div>
                    <div>
                      <div className="text-sp-cream/40 text-xs mb-0.5">{c.title}</div>
                      <div className="text-sp-cream font-semibold">
                        {c.href ? <a href={c.href} className="hover:text-sp-orange transition-colors">{c.text}</a> : c.text}
                      </div>
                      <div className="text-sp-cream/40 text-sm">{c.sub}</div>
                    </div>
                  </div>
                </RevealSection>
              ))}
              <RevealSection delay={0.4}>
                <a href="tel:+79055471640" className="flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/20">
                  <Phone size={16} />
                  Позвонить
                </a>
              </RevealSection>
            </div>

            <RevealSection delay={0.2} className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden border border-white/8 h-80 md:h-96 shadow-xl">
                <iframe src="https://yandex.ru/map-widget/v1/org/sol_i_perets/172085958854/?ll=37.282959%2C55.944047&z=16" width="100%" height="100%" frameBorder="0" title="Карта" className="grayscale-[30%]" />
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ════════════════════ FINAL CTA ════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-sp-orange to-red-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative container mx-auto px-4 text-center">
          <h2 className="text-white font-bold text-3xl md:text-5xl mb-4 leading-tight">Готовы попробовать?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">Ждём вас ежедневно с 09:00. Уют, вкусная еда и тёплая атмосфера.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reserve" className="inline-flex items-center justify-center gap-2 bg-white text-sp-orange font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-sp-cream hover:scale-105 shadow-2xl">
              <Sparkles size={18} />
              Забронировать стол
            </Link>
            <a href="tel:+79055471640" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-white/10 hover:border-white/60">
              <Phone size={18} />
              Позвонить: +7 (905) 547-16-40
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
