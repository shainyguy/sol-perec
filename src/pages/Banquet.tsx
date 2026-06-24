import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, ChevronDown, ChevronUp, Check, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createBanquet } from '../lib/db';
import { formatPhone, isValidPhone } from '../lib/phone';

const PACKAGES = [
  {
    id: 'base',
    name: 'Базовый',
    price: 4000,
    tag: 'Оптимально',
    tagColor: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    color: 'border-blue-500/25 bg-blue-500/5',
    activeColor: 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10',
    accentLine: 'from-blue-500 to-blue-400',
    badge: 'bg-blue-500',
    includes: [
      '🧀 Холодные закуски (ассорти салатов, сырная тарелка)',
      '🥩 Шашлык на мангале (курица / свинина / телятина)',
      '🥘 Садж на выбор',
      '🍲 Горячие блюда (на выбор)',
      '🥗 Гарниры и соусы',
      '🥤 Напитки (морс, лимонад, вода)',
      '🍞 Хлебная корзинка',
      '🎵 Живая музыка',
    ],
  },
  {
    id: 'extended',
    name: 'Расширенный',
    price: 5000,
    tag: 'Популярный',
    tagColor: 'bg-sp-orange/15 text-sp-orange border-sp-orange/25',
    color: 'border-sp-orange/25 bg-sp-orange/5',
    activeColor: 'border-sp-orange bg-sp-orange/10 shadow-lg shadow-sp-orange/10',
    accentLine: 'from-amber-500 to-sp-orange',
    badge: 'bg-sp-orange',
    includes: [
      '🍖 Мясное и рыбное ассорти',
      '🥟 Домашние закуски (хачапури, кутабы, долма)',
      '🍢 Шашлычный микс (баранина + телятина + курица)',
      '🥘 Садж ассорти',
      '🍲 Горячее на выбор + гарниры',
      '🥗 Салатная тарелка (4 вида)',
      '🧀 Сырная тарелка',
      '🍰 Десерты (медовик, пахлава)',
      '🎵 Живая музыка + DJ',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 6000,
    tag: 'Премиум',
    tagColor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    color: 'border-yellow-500/25 bg-yellow-500/5',
    activeColor: 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10',
    accentLine: 'from-yellow-400 to-amber-500',
    badge: 'bg-yellow-500',
    includes: [
      '🔥 Фирменный сет «Соль и Перец»',
      '🥩 Шашлык из баранины и телятины',
      '🥘 Садж ассорти (3 вида мяса)',
      '🍚 Плов фирменный / шах-плов',
      '🐟 Рыба на мангале (форель / сибас)',
      '🥟 Хачапури, кутабы, хинкали',
      '🍰 Десертный сет',
      '🥤 Свежевыжатые соки и напитки',
      '🎵 Живая музыка + DJ + ведущий',
    ],
  },
];

const EXTRA = [
  { id: 'Декор зала',          label: '🎀 Декор зала',                      price: 5000 },
  { id: 'Фотозона',            label: '📸 Фотозона с реквизитом',            price: 5000 },
  { id: 'Ведущий',             label: '🎤 Профессиональный ведущий',         price: 10000 },
  { id: 'Караоке',             label: '🎤 Караоке-оборудование',             price: 5000 },
  { id: 'Фотограф',            label: '📷 Фотограф на мероприятие',          price: 8000 },
  { id: 'Видеосъёмка',         label: '🎥 Видеосъёмка + монтаж',            price: 12000 },
  { id: 'Шоу-программа',       label: '🎭 Шоу-программа (артисты)',          price: 15000 },
  { id: 'Выездной кейтеринг',  label: '🚚 Выездное обслуживание с мангалом', price: 20000 },
  { id: 'Трансфер гостей',     label: '🚌 Трансфер гостей',                  price: 7000 },
  { id: 'Салют / фейерверк',   label: '🎆 Салют / фейерверк',               price: 15000 },
];

const REVIEWS = [
  { name: 'Марина К.',  stars: 5, text: 'Отмечали день рождения на 40 человек. Всё прошло отлично — вкусная еда, живая музыка, внимательный персонал!' },
  { name: 'Алексей Д.', stars: 5, text: 'Заказывали корпоратив по пакету VIP. Очень достойный уровень, шашлык из баранины был просто невероятный.' },
  { name: 'Наталья В.', stars: 5, text: 'Свадьба на 80 гостей — всё организовали идеально. Рекомендуем всей душой!' },
];

export default function Banquet() {
  const [selectedPkg, setSelectedPkg]     = useState('');
  const [guests, setGuests]               = useState(20);
  const [services, setServices]           = useState<string[]>([]);
  const [date, setDate]                   = useState('');
  const [occasion, setOccasion]           = useState('');
  const [form, setForm]                   = useState({ name: '', phone: '', comment: '' });
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState('');
  const [expandedPkg, setExpandedPkg]     = useState<string | null>(null);

  const pkg      = PACKAGES.find(p => p.id === selectedPkg);
  const pkgTotal = pkg ? pkg.price * guests : 0;
  const svcTotal = EXTRA.filter(s => services.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const total    = pkgTotal + svcTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !date) { setError('Заполните имя, телефон и дату'); return; }
    if (!isValidPhone(form.phone)) { setError('Введите корректный номер телефона'); return; }
    setLoading(true); setError('');
    try {
      await createBanquet({
        contact_name: form.name, contact_phone: form.phone,
        event_type: occasion || 'Не указан', package_name: selectedPkg || 'Не выбран',
        guests_count: guests, event_date: date,
        extra_services: services, estimated_total: total,
        comment: form.comment, status: 'new',
      });
      setSuccess(true);
    } catch { setError('Ошибка. Попробуйте ещё раз.'); }
    finally { setLoading(false); }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-sp-darkest pt-20 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center p-10 max-w-md"
        >
          <motion.div
            animate={{ rotate: [0, 14, -8, 0] }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-7xl mb-6 select-none"
          >🎉</motion.div>
          <h2 className="font-display text-3xl text-sp-orange font-bold mb-3">Заявка отправлена!</h2>
          <p className="text-sp-cream/60 mb-6 leading-relaxed">
            Наш менеджер свяжется с вами<br />в ближайшее время.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSuccess(false); setSelectedPkg(''); setServices([]); setOccasion(''); setForm({ name: '', phone: '', comment: '' }); }}
              className="btn-primary"
            >
              Отправить ещё
            </button>
            <a href="tel:+79055471640" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Phone size={15} />Позвонить
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-sp-darkest">
      <title>Банкеты и мероприятия — Соль и Перец | Сходня</title>
      <meta
        name="description"
        content="Организуем банкеты, дни рождения, корпоративы и свадьбы в кафе Соль и Перец в Сходне. Пакеты от 4 000 ₽ на человека. Вместимость до 200 гостей, живая музыка, мангал."
      />

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <div className="relative pt-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/banquet.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.35,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sp-darkest/50 via-sp-dark/80 to-sp-darkest" />

        <div className="relative container mx-auto px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-sp-orange/15 border border-sp-orange/30 text-sp-orange text-xs px-4 py-1.5 rounded-full mb-5 font-medium">
              🔥 До 200 гостей · живая музыка · мангал
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-sp-cream font-bold mb-4 leading-tight max-w-2xl">
              Банкеты<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sp-orange to-red-400">
                и мероприятия
              </span>
            </h1>
            <p className="text-sp-cream/60 max-w-lg text-sm md:text-base mb-8 leading-relaxed">
              Организуем любое торжество — от камерного ужина до большой свадьбы.
              Пакеты от 4 000 ₽ / чел. Подбираем программу под ваш бюджет.
            </p>

            {/* Key stats */}
            <div className="flex flex-wrap gap-4">
              {[
                { value: '200', label: 'гостей максимум' },
                { value: '7', label: 'лет опыта' },
                { value: '4.9★', label: 'рейтинг банкетов' },
              ].map(s => (
                <div key={s.value} className="text-center bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl px-5 py-3">
                  <div className="font-display text-2xl text-sp-orange font-bold leading-none">{s.value}</div>
                  <div className="text-sp-cream/40 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ SOCIAL PROOF REVIEWS ═════════════════════════════════════════════ */}
      <div className="border-y border-white/5 bg-sp-dark/50 py-8 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-sp-dark rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} size={11} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sp-cream/65 text-sm leading-relaxed mb-3 line-clamp-3">«{r.text}»</p>
                <span className="text-sp-cream/35 text-xs font-medium">{r.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FORM ═════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Occasion */}
          <div className="bg-sp-dark rounded-2xl p-6 border border-white/5">
            <h2 className="text-sp-cream font-semibold text-lg mb-4 flex items-center gap-2">
              🎊 Повод
            </h2>
            <input
              type="text"
              placeholder="День рождения, корпоратив, свадьба, годовщина..."
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Packages */}
          <div className="bg-sp-dark rounded-2xl p-6 border border-white/5">
            <h2 className="text-sp-cream font-semibold text-lg mb-1 flex items-center gap-2">
              📦 Пакет обслуживания
            </h2>
            <p className="text-sp-cream/40 text-sm mb-5">Цена указана за одного гостя</p>
            <div className="flex flex-col gap-3">
              {PACKAGES.map(p => (
                <div
                  key={p.id}
                  className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    selectedPkg === p.id ? p.activeColor : p.color
                  }`}
                >
                  {selectedPkg === p.id && (
                    <div className={`h-0.5 bg-gradient-to-r ${p.accentLine}`} />
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPkg(selectedPkg === p.id ? '' : p.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selectedPkg === p.id ? `${p.badge} border-transparent` : 'border-white/20'
                        }`}
                      >
                        {selectedPkg === p.id && <Check size={11} className="text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sp-cream font-semibold">{p.name}</span>
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${p.tagColor}`}>
                            {p.tag}
                          </span>
                        </div>
                        <div className="text-sp-cream/40 text-xs mt-0.5">{p.includes.length} позиций включено</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sp-orange font-bold text-lg">{p.price.toLocaleString('ru-RU')} ₽</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setExpandedPkg(expandedPkg === p.id ? null : p.id); }}
                        className="text-sp-cream/40 hover:text-sp-cream transition-colors"
                        aria-label="Показать состав пакета"
                      >
                        {expandedPkg === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedPkg === p.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-white/8 pt-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {p.includes.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-sp-cream/70">
                                <span className="text-sp-orange mt-0.5 flex-shrink-0">✓</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Guests slider */}
          <div className="bg-sp-dark rounded-2xl p-6 border border-white/5">
            <h2 className="text-sp-cream font-semibold text-lg mb-5 flex items-center gap-2">
              <Users size={18} className="text-sp-orange" />
              Количество гостей:&nbsp;
              <span className="text-sp-orange font-bold">{guests}</span>
            </h2>
            <input
              type="range" min={10} max={200} step={5}
              value={guests}
              onChange={e => setGuests(parseInt(e.target.value))}
              className="w-full accent-sp-orange"
            />
            <div className="flex justify-between text-xs text-sp-cream/40 mt-2">
              <span>10 чел.</span>
              <span>100 чел.</span>
              <span>200 чел.</span>
            </div>

            {/* Capacity note */}
            <p className="mt-3 text-sp-cream/35 text-xs">
              {guests <= 40
                ? '🪑 Малый зал — уютная атмосфера до 40 гостей'
                : guests <= 100
                  ? '🏛 Большой зал — комфортно для 40–100 гостей'
                  : '🎪 Весь ресторан + терраса — от 100 до 200 гостей'}
            </p>
          </div>

          {/* Extra services */}
          <div className="bg-sp-dark rounded-2xl p-6 border border-white/5">
            <h2 className="text-sp-cream font-semibold text-lg mb-4">✨ Дополнительные услуги</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXTRA.map(s => (
                <label
                  key={s.id}
                  className={`flex items-center justify-between cursor-pointer p-3 rounded-xl border transition-all ${
                    services.includes(s.id)
                      ? 'border-sp-orange/40 bg-sp-orange/8'
                      : 'border-white/5 hover:border-white/15 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={services.includes(s.id)}
                      onChange={() => setServices(prev =>
                        prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                      )}
                      className="accent-sp-orange w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-sp-cream/80 text-sm">{s.label}</span>
                  </div>
                  <span className="text-sp-orange text-sm font-medium flex-shrink-0">+{s.price.toLocaleString('ru-RU')} ₽</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cost calculator */}
          <motion.div
            animate={{ scale: total > 0 ? 1.01 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-gradient-to-br from-sp-orange/8 to-red-500/5 border border-sp-orange/25 rounded-2xl p-6"
          >
            <h3 className="text-sp-cream font-semibold mb-4 flex items-center gap-2">
              💰 Расчёт стоимости
            </h3>
            <div className="flex flex-col gap-2.5 text-sm">
              {pkg ? (
                <div className="flex justify-between text-sp-cream/65">
                  <span>Пакет «{pkg.name}» ({guests} чел. × {pkg.price.toLocaleString('ru-RU')} ₽)</span>
                  <span className="font-medium tabular-nums">{pkgTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              ) : (
                <div className="text-sp-cream/35 italic">Выберите пакет для расчёта</div>
              )}

              {EXTRA.filter(s => services.includes(s.id)).map(s => (
                <div key={s.id} className="flex justify-between text-sp-cream/60">
                  <span>{s.label}</span>
                  <span className="tabular-nums">+{s.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}

              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-sp-cream font-semibold">Ориентировочно:</span>
                <span className="text-sp-orange font-bold text-2xl tabular-nums">
                  {total > 0 ? `${total.toLocaleString('ru-RU')} ₽` : '—'}
                </span>
              </div>

              {total > 0 && (
                <p className="text-sp-cream/35 text-xs">
                  * Итоговая стоимость уточняется при встрече с менеджером
                </p>
              )}
            </div>
          </motion.div>

          {/* Contacts */}
          <div className="bg-sp-dark rounded-2xl p-6 border border-white/5">
            <h2 className="text-sp-cream font-semibold text-lg mb-5 flex items-center gap-2">
              📞 Контактные данные
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">
                  <Calendar size={13} className="inline mr-1" />
                  Дата мероприятия *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Ваше имя *</label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
                  className="form-input"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className="form-label">Телефон *</label>
                <input
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={form.phone}
                  onChange={e => setForm(v => ({ ...v, phone: formatPhone(e.target.value) }))}
                  className="form-input"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </div>
              <div>
                <label className="form-label">Комментарий</label>
                <textarea
                  placeholder="Особые пожелания, аллергии, любимые блюда..."
                  value={form.comment}
                  onChange={e => setForm(v => ({ ...v, comment: e.target.value }))}
                  className="form-input resize-none h-24"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-base py-4"
          >
            {loading ? 'Отправляем...' : '🎉 Отправить заявку на банкет'}
          </button>

          <p className="text-sp-cream/30 text-xs text-center">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <a href="/privacy" className="underline hover:text-sp-cream/50 transition-colors">
              политикой конфиденциальности
            </a>
          </p>

          {/* Call CTA */}
          <div className="bg-sp-dark border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sp-cream font-medium text-sm mb-1">Предпочитаете обсудить по телефону?</div>
              <div className="text-sp-cream/40 text-xs">Менеджер ответит на все вопросы</div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a
                href="tel:+79055471640"
                className="inline-flex items-center gap-2 bg-sp-orange hover:bg-sp-orange/90 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all"
              >
                <Phone size={14} /> Позвонить
              </a>
              <Link
                to="/reserve"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-sp-cream/70 hover:text-sp-cream px-5 py-2.5 rounded-full text-sm transition-all"
              >
                Бронь стола
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
