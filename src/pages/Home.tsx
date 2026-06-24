import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Star, Clock, Users, Flame, MapPin, Phone, Shield, Trophy, Sparkles, ChefHat, Wine, Music, Camera, Heart, ArrowRight, CheckCircle2, ShoppingBag, Bike, Zap, Gift } from 'lucide-react';
import MenuCard, { type MenuItem } from '../components/MenuCard';

const FEATURED_DISHES: MenuItem[] = [
  { id: 1, name: 'Шашлык из баранины', description: 'Сочная баранина, маринованная 12 часов. Подаётся с лавашом, печёным перцем и соусом.', price: 890, category: 'Шашлык', image_url: '', calories: 420, cook_time: 25 },
  { id: 2, name: 'Люля-кебаб из баранины', description: 'Ароматный люля-кебаб с зеленью и специями. Подаётся с печёным помидором.', price: 690, category: 'Шашлык', image_url: '', calories: 380, cook_time: 20, is_special: true },
  { id: 3, name: 'Плов по-фергански', description: 'Рассыпчатый плов из баранины с жёлтой морковью и чесноком. Готовится в казане.', price: 750, category: 'Горячее', image_url: '', calories: 550, cook_time: 30 },
  { id: 4, name: 'Хачапури по-аджарски', description: 'Свежая выпечка с сыром сулугуни, сливочным маслом и яйцом.', price: 520, category: 'Выпечка', image_url: '', calories: 340, cook_time: 20 },
  { id: 5, name: 'Шаурма из баранины', description: 'Сочная шаурма с бараниной, овощами и фирменным соусом на лаваше.', price: 580, category: 'Шашлык', image_url: '', calories: 460, cook_time: 15 },
  { id: 6, name: 'Салат с телятиной', description: 'Тёплый салат с телятиной гриль, рукколой, черри и пармезаном.', price: 490, category: 'Салаты', image_url: '', calories: 280, cook_time: 15 },
  { id: 7, name: 'Суп харчо', description: 'Наваристый суп из баранины с рисом, томатами и кинзой.', price: 420, category: 'Супы', image_url: '', calories: 310, cook_time: 25 },
  { id: 8, name: 'Чай с травами', description: 'Сбор из горных трав с чабрецом, мятой и мелиссой.', price: 250, category: 'Напитки', image_url: '', calories: 0 },
];

const PROMOS_DATA = [
  { id: 1, title: 'Скидка на шашлык', description: 'Каждую среду — скидка 20% на весь шашлык из баранины. Приходите за сочным мясом с мангала!', discount_text: '-20% на шашлык', expires_at: '' },
  { id: 2, title: 'Банкет до 15 чел.', description: 'При заказе банкета от 15 человек — бесплатный торт от шеф-повара и скидка 10% на бар.', discount_text: 'Банкет со скидкой', expires_at: '' },
  { id: 3, title: 'День рождения', description: 'Именинникам скидка 15% на всё меню и комплимент от заведения — чайничек фирменного чая!', discount_text: '15% именинникам', expires_at: '' },
];

function Countdown({ target }: { target?: string }) {
  const [t, setT] = useState({ d: 7, h: 0, m: 0 });
  const end = target && !isNaN(new Date(target).getTime()) ? new Date(target).getTime() : Date.now() + 7 * 86400000;
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setT({ d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60 });
    };
    tick(); const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [end]);
  return (
    <div className="flex gap-2 justify-center">
      {[['д', t.d], ['ч', t.h], ['м', t.m]].map(([l, v]) => (
        <div key={l as string} className="flex flex-col items-center">
          <div className="bg-black/30 backdrop-blur rounded-lg px-2 py-1 font-mono font-bold text-sp-orange text-base min-w-[32px] text-center">{String(v).padStart(2, '0')}</div>
          <span className="text-white/40 text-[10px] mt-0.5">{l}</span>
        </div>
      ))}
    </div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full mix-blend-screen" style={{ width: 60 + i * 40, height: 60 + i * 40, left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%`, background: i % 2 === 0 ? 'radial-gradient(circle, rgba(232,98,26,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255,200,100,0.08) 0%, transparent 70%)' }}
          animate={{ y: [0, -30, 0, 20, 0], opacity: [0.3, 0.6, 0.3, 0.5, 0.3], scale: [1, 1.1, 1, 1.05, 1] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }} />
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
    const duration = 1500;
    const startTime = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
    <motion.div ref={ref as any} initial={{ opacity: 0, y: 50 }} animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = { current: null as null | HTMLDivElement };
  const isVisible = useInView(ref as any, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref as any} initial="hidden" animate={isVisible ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }} className={className}>
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const galleryGrid = [
  { emoji: '🥩', color: 'from-red-900/30 to-amber-900/20', label: 'Шашлык на мангале', cols: 'md:col-span-2 md:row-span-2' },
  { emoji: '🍲', color: 'from-amber-900/20 to-orange-900/20', label: 'Авторский плов' },
  { emoji: '🧀', color: 'from-yellow-900/20 to-orange-900/20', label: 'Хачапури' },
  { emoji: '🥗', color: 'from-green-900/20 to-emerald-900/20', label: 'Салаты' },
  { emoji: '🍷', color: 'from-red-900/20 to-rose-900/20', label: 'Винная карта' },
  { emoji: '🏠', color: 'from-blue-900/20 to-indigo-900/20', label: 'Уютный зал' },
];

const benefits = [
  { icon: <Flame size={24} />, title: 'Мангал круглый год', desc: 'Настоящий шашлык на древесных углях — в любую погоду', color: 'from-orange-500 to-red-500' },
  { icon: <ChefHat size={24} />, title: 'Авторская кухня', desc: 'Шеф-повар с 15-летним стажем создаёт уникальные рецепты', color: 'from-amber-500 to-orange-500' },
  { icon: <Heart size={24} />, title: 'Домашний уют', desc: 'Тёплая атмосфера, приглушённый свет и живая музыка по пятницам', color: 'from-rose-500 to-pink-500' },
  { icon: <Shield size={24} />, title: 'Свежесть продуктов', desc: 'Ежедневные поставки от местных фермеров — никаких полуфабрикатов', color: 'from-green-500 to-emerald-500' },
  { icon: <Users size={24} />, title: 'Любое мероприятие', desc: 'Дни рождения, корпоративы, свадьбы — организуем под ключ', color: 'from-blue-500 to-indigo-500' },
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

export default function Home() {
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-sp-darkest">
      <title>Соль и Перец — Ресторан в Сходне | Шашлык, Плов, Банкеты от 4 000 ₽</title>
      <meta name="description" content="Ресторан «Соль и Перец» в Сходне (ул. Некрасова 15). Шашлык из баранины, плов, хачапури, банкеты от 4 000 ₽. Живая музыка, доставка, бронирование. Работаем ежедневно с 09:00." />
      <meta property="og:title" content="Соль и Перец — Ресторан в Сходне" />
      <meta property="og:description" content="Домашняя кухня, шашлык на мангале, плов, хачапури. Банкеты от 4 000 ₽. ул. Некрасова 15." />
      <meta property="og:image" content="/images/hero-bg.jpg" />
      <meta name="keywords" content="соль и перец, сходня, ресторан сходня, шашлык сходня, банкет сходня, плов, кафе сходня" />
      <link rel="canonical" href="https://sol-i-perets.ru" />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-sp-darkest to-sp-darkest" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 via-transparent to-amber-900/20" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)' }} />
          <motion.div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(232,98,26,0.25) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(255,200,100,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(200,80,20,0.08) 0%, transparent 40%)' }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23E8621A\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.6 }} />
        </motion.div>

        <FloatingOrbs />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-sp-cream/70 text-sm px-4 py-2 rounded-full mb-8">
              <MapPin size={13} className="text-sp-orange" /> МЦД Сходня · ул. Некрасова 15
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

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-sp-cream/60 text-lg md:text-xl mb-4 max-w-2xl mx-auto font-light leading-relaxed">
            Ресторан домашней кухни в Сходне
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {['Шашлык', 'Мангал', 'Плов', 'Банкеты', 'Доставка'].map(tag => (
              <span key={tag} className="px-4 py-1.5 text-sm bg-white/5 border border-white/10 rounded-full text-sp-cream/50 hover:text-sp-cream hover:border-sp-orange/30 transition-all cursor-default">{tag}</span>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="group relative inline-flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-sp-orange/25 hover:shadow-sp-orange/40 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Flame size={18} /> Смотреть меню
            </Link>
            <Link to="/reserve" className="inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-sp-cream font-bold px-8 py-4 rounded-full text-base transition-all hover:bg-white/5 backdrop-blur-sm">
              <Sparkles size={18} /> Забронировать стол
            </Link>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sp-cream/20">
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
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all">
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

      {/* ════════════════════ DELIVERY PROMO ════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-sp-darkest to-orange-900/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sp-orange/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <motion.div className="relative bg-gradient-to-br from-sp-orange/[0.07] via-sp-dark to-amber-500/[0.05] rounded-3xl border border-sp-orange/10 p-8 md:p-12 lg:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sp-orange/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
              </div>
              <div className="relative grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white text-sm font-bold px-4 py-2 rounded-full mb-6 shadow-lg shadow-sp-orange/20">
                    <Zap size={14} /> Успейте заказать
                  </div>
                  <h2 className="text-sp-cream font-bold text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
                    Доставим шашлык <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-sp-orange">горячим за 40 минут</span>
                  </h2>
                  <p className="text-sp-cream/50 leading-relaxed mb-8 max-w-lg text-base">
                    Закажите любимые блюда онлайн — привезём прямо к двери. 
                    Бесплатная доставка при заказе от 1 500 ₽. Шашлык, плов, хачапури — всё как в ресторане.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
                    {[
                      { icon: <Bike size={20} />, value: '40 мин', label: 'Среднее время' },
                      { icon: <Gift size={20} />, value: '0 ₽', label: 'Доставка от 1 500 ₽' },
                      { icon: <Flame size={20} />, value: 'Горячим', label: 'В термосумке' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="text-sp-orange flex justify-center mb-1.5">{item.icon}</div>
                        <div className="text-sp-cream font-bold text-lg">{item.value}</div>
                        <div className="text-sp-cream/40 text-xs">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/menu" className="group relative inline-flex items-center justify-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-sp-orange/25 hover:shadow-sp-orange/40 overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <ShoppingBag size={18} /> Заказать онлайн
                    </Link>
                    <a href="tel:+79055471640" className="inline-flex items-center justify-center gap-2 border-2 border-white/15 hover:border-white/30 text-sp-cream font-medium px-8 py-4 rounded-full text-base transition-all hover:bg-white/5">
                      <Phone size={18} /> +7 (905) 547-16-40
                    </a>
                  </div>
                </div>
                <div className="hidden md:flex md:col-span-2 items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-sp-orange/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-amber-500/10 via-sp-orange/5 to-amber-500/10 rounded-3xl border border-amber-500/15 p-6 text-center backdrop-blur">
                      <div className="text-6xl mb-4">🏍️</div>
                      <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-4 mb-3">
                        <div className="text-sp-orange font-bold text-2xl">Бесплатно</div>
                        <div className="text-sp-cream/40 text-sm">при заказе от 1 500 ₽</div>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sp-cream/50 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Работаем ежедневно с 09:00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

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
            {FEATURED_DISHES.map((item) => (
              <motion.div key={item.id} variants={staggerItem}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </StaggerChildren>

          <RevealSection delay={0.3}>
            <div className="text-center mt-12">
              <Link to="/menu" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sp-orange/30 text-sp-cream font-medium px-8 py-3.5 rounded-full text-sm transition-all">
                Смотреть полное меню <ArrowRight size={14} />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════ PROMOS ════════════════════ */}
      <section className="py-20 bg-sp-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-sp-dark via-transparent to-sp-dark" />
        <div className="container mx-auto px-4 relative">
          <RevealSection>
            <div className="text-center mb-12">
              <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Не упустите</span>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Действующие акции</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {PROMOS_DATA.map(p => (
                <motion.div key={p.id} whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] p-6 hover:border-sp-orange/20 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sp-orange/5 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="inline-block bg-gradient-to-r from-amber-500 to-sp-orange text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
                      {p.discount_text}
                    </div>
                    <h3 className="text-sp-cream font-bold text-xl mb-2">{p.title}</h3>
                    <p className="text-sp-cream/50 text-sm mb-4 leading-relaxed">{p.description}</p>
                    {p.id === 1 && (
                      <>
                        <div className="text-sp-cream/30 text-xs mb-1.5">Каждую среду</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded">Действует</span>
                          <span className="text-sp-cream/30 text-xs">Постоянная акция</span>
                        </div>
                      </>
                    )}
                    {p.id === 2 && (
                      <>
                        <div className="text-sp-cream/30 text-xs mb-1.5">Предложение ограничено</div>
                        <Countdown />
                      </>
                    )}
                    {p.id === 3 && (
                      <div className="text-sp-cream/30 text-xs flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-400" />
                        При предъявлении паспорта
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ════════════════════ GALLERY ════════════════════ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center mb-12">
              <span className="text-sp-orange text-sm font-bold uppercase tracking-[0.2em]">Галерея</span>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mt-2">Атмосфера и кухня</h2>
              <p className="text-sp-cream/40 mt-3 max-w-lg mx-auto">Загляните в наш уютный зал и оцените блюда от шеф-повара</p>
            </div>
          </RevealSection>

          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryGrid.map((item, i) => (
              <motion.div key={i} variants={staggerItem}
                className={`relative overflow-hidden rounded-2xl cursor-pointer group aspect-square ${item.cols || ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                  <span className="text-white/70 text-sm font-medium">{item.label}</span>
                </div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

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
                    <CheckCircle2 size={14} className="text-green-400" /> Индивидуальный подбор меню
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {banquetServices.map((s, i) => (
                  <motion.div key={i} whileHover={{ y: -3 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 hover:bg-amber-500/5 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 text-amber-400">{s.icon}</div>
                    <h4 className="text-sp-cream font-semibold text-sm mb-1">{s.title}</h4>
                    <p className="text-sp-cream/40 text-xs leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/banquet" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-sp-orange text-white font-bold px-8 py-4 rounded-full text-base transition-all shadow-lg shadow-sp-orange/20 hover:shadow-sp-orange/30">
                  <Sparkles size={18} /> Заказать банкет
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
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={28} className="text-yellow-500 fill-yellow-500" />)}
              </div>
              <h2 className="text-sp-cream font-bold text-3xl md:text-4xl mb-3">Нас ценят гости</h2>
              <p className="text-sp-cream/50 mb-8 max-w-md mx-auto">Более 100 отзывов на Яндекс.Картах с оценкой 4.8 — приходите и убедитесь сами!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://yandex.ru/maps/org/sol_i_perets/172085958854/reviews/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-sp-orange/20">
                  <Star size={16} /> Читать отзывы
                </a>
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
                  <Phone size={16} /> Позвонить
                </a>
              </RevealSection>
            </div>

            <RevealSection delay={0.2} className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden border border-white/8 h-80 md:h-96 shadow-xl">
                <iframe src="https://yandex.ru/map-widget/v1/org/sol_i_perets/172085958854/?ll=37.282959%2C55.944047&z=16" width="100%" height="100%" frameBorder="0" title="Карта" className="grayscale-[30%]" loading="lazy" />
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

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative container mx-auto px-4 text-center">
          <h2 className="text-white font-bold text-3xl md:text-5xl mb-4 leading-tight">Готовы попробовать?</h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">Ждём вас ежедневно с 09:00. Уют, вкусная еда и тёплая атмосфера.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reserve" className="inline-flex items-center justify-center gap-2 bg-white text-sp-orange font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-sp-cream hover:scale-105 shadow-2xl">
              <Sparkles size={18} /> Забронировать стол
            </Link>
            <a href="tel:+79055471640" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:bg-white/10 hover:border-white/60">
              <Phone size={18} /> +7 (905) 547-16-40
            </a>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════ SCHEMA.ORG ════════════════════ */}
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Соль и Перец',
        description: 'Ресторан домашней кухни в Сходне. Шашлык, плов, хачапури, банкеты.',
        url: 'https://sol-i-perets.ru',
        telephone: '+79055471640',
        address: { '@type': 'PostalAddress', streetAddress: 'ул. Некрасова 15', addressLocality: 'Химки', addressRegion: 'Московская обл.', addressCountry: 'RU' },
        servesCuisine: ['Russian', 'Caucasian', 'Grill'],
        priceRange: '₽₽',
        openingHours: ['Mo-Fr 09:00-01:00', 'Sa-Su 09:00-05:00'],
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '100', bestRating: '5' },
      })}</script>
    </div>
  );
}
