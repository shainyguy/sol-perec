import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, MapPin, Clock, Info, Phone, Shield, CheckCircle } from 'lucide-react';
import FloorPlan from '../components/FloorPlan';
import { formatPhone, isValidPhone } from '../lib/phone';

interface Reservation {
  id: number;
  table_number: number | null;
  date: string;
  time: string;
  status: string;
  guests_count: number;
  guest_name: string;
}

const TIMES = [
  '09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00',
  '17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00',
];

const TRUST_SIGNALS = [
  { icon: CheckCircle, text: 'Подтверждаем в течение 15 минут' },
  { icon: Shield,       text: 'Бесплатная отмена за 2 часа' },
  { icon: Phone,        text: 'Или позвоните: +7 (905) 547-16-40' },
];

export default function Reserve() {
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [selectedTable, setSelectedTable]   = useState<number | null>(null);
  const [date, setDate]                     = useState('');
  const [time, setTime]                     = useState('');
  const [form, setForm]                     = useState({ name: '', phone: '', guests: '2' });
  const [dayReservations, setDayReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);
  const [error, setError]                   = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadDay = useCallback(async (d: string) => {
    if (!d) return;
    try {
      const res  = await fetch(`/api/reservations?date=${d}`);
      const data = await res.json();
      setDayReservations(
        Array.isArray(data)
          ? data.filter((r: Reservation) => r.status !== 'cancelled' && r.table_number !== null)
          : []
      );
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (date) loadDay(date);
    else setDayReservations([]);
  }, [date, loadDay]);

  const bookedAtTime: number[] = (time
    ? dayReservations.filter(r => r.time === time && r.table_number !== null)
    : []
  ).map(r => r.table_number as number);

  const bookedAnyTime: number[] = [...new Set(
    dayReservations
      .filter(r => r.table_number !== null)
      .map(r => r.table_number as number)
  )];

  const handleSelectTable = (n: number) => {
    if (n === 0) { setSelectedTable(null); return; }
    setSelectedTable(n);
    setShowFloorPlan(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !date || !time) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Пожалуйста, введите корректный номер телефона');
      return;
    }
    if (selectedTable && bookedAtTime.includes(selectedTable)) {
      setError(`Стол №${selectedTable} уже занят в ${time}. Выберите другой стол или время.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: form.name,
          guest_phone: form.phone,
          date,
          time,
          guests_count: parseInt(form.guests),
          table_number: selectedTable,
          status: 'pending',
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError('Ошибка при бронировании. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setSelectedTable(null);
    setDate('');
    setTime('');
    setForm({ name: '', phone: '', guests: '2' });
    setError('');
    setDayReservations([]);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-sp-darkest pt-20 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="text-center p-10 max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: [0, 12, -8, 5, 0] }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-7xl mb-6 select-none"
          >🎉</motion.div>
          <h2 className="font-display text-3xl text-sp-orange font-bold mb-3">Стол забронирован!</h2>
          <p className="text-sp-cream/60 mb-2 leading-relaxed">
            Мы позвоним для подтверждения<br />в течение <span className="text-sp-cream/80 font-medium">15 минут</span>.
          </p>
          {selectedTable && (
            <div className="inline-flex items-center gap-2 mt-2 mb-6 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sp-cream/50 text-sm">
              <MapPin size={13} className="text-sp-orange" />
              Стол №{selectedTable} · {date} · {time}
            </div>
          )}
          {!selectedTable && (
            <div className="mb-6 text-sp-cream/35 text-sm">
              {date} · {time}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="btn-primary">Забронировать ещё</button>
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
    <>
      <FloorPlan
        open={showFloorPlan}
        onClose={() => setShowFloorPlan(false)}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
        bookedTables={time ? bookedAtTime : bookedAnyTime}
        softBookedTables={time ? bookedAnyTime.filter(n => !bookedAtTime.includes(n)) : []}
        date={date}
        time={time}
      />

      <div className="min-h-screen bg-sp-darkest">
        <title>Бронирование стола — Соль и Перец | Сходня</title>
        <meta
          name="description"
          content="Забронируйте стол в кафе Соль и Перец в Сходне. Выберите место на схеме зала, укажите дату и время. Подтверждение за 15 минут. Бесплатная отмена за 2 часа."
        />

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <div className="relative pt-20 overflow-hidden bg-sp-dark">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/images/banquet.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              opacity: 0.12,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sp-dark/40 via-sp-dark to-sp-darkest" />

          <div className="relative container mx-auto px-4 py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <h1 className="font-display text-4xl md:text-5xl text-sp-cream font-bold mb-2 leading-tight">
                Бронирование стола
              </h1>
              <p className="text-sp-cream/50 mb-6 text-sm md:text-base">
                Выберите удобное место и дату — подтвердим за 15 минут
              </p>

              {/* Trust signals strip */}
              <div className="flex flex-wrap gap-3">
                {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-sp-cream/50 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
                    <Icon size={11} className="text-sp-orange flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══ FORM ════════════════════════════════════════════════════════════ */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Step 1 — Date & Time */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-sp-dark rounded-2xl p-6 border border-white/5"
            >
              <h2 className="text-sp-cream font-semibold mb-5 flex items-center gap-2">
                <Calendar size={17} className="text-sp-orange" />
                Дата и время
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Дата *</label>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={e => { setDate(e.target.value); setSelectedTable(null); }}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Время *</label>
                  <select
                    value={time}
                    onChange={e => { setTime(e.target.value); setSelectedTable(null); }}
                    className="form-input"
                    required
                  >
                    <option value="">Выберите...</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {date && dayReservations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-start gap-2 bg-sp-orange/8 border border-sp-orange/15 rounded-xl px-3 py-2.5 text-sm overflow-hidden"
                  >
                    <Info size={13} className="text-sp-orange mt-0.5 flex-shrink-0" />
                    <span className="text-sp-cream/60">
                      На {new Date(date + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}{' '}
                      уже <span className="text-sp-orange font-medium">
                        {dayReservations.length} {dayReservations.length === 1 ? 'бронь' : dayReservations.length < 5 ? 'брони' : 'броней'}
                      </span>.
                      {time && bookedAtTime.length > 0 && (
                        <> В {time}: <span className="text-red-400">столы {bookedAtTime.join(', ')}</span> заняты.</>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Step 2 — Table selection */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-sp-dark rounded-2xl p-6 border border-white/5"
            >
              <h2 className="text-sp-cream font-semibold mb-4 flex items-center gap-2">
                <MapPin size={17} className="text-sp-orange" />
                Выбор стола
              </h2>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowFloorPlan(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  🗺️ {selectedTable ? `Стол №${selectedTable} (изменить)` : 'Открыть схему зала'}
                </button>
                {selectedTable && (
                  <button
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="btn-secondary text-sm"
                  >
                    Сбросить
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-xs text-sp-cream/40">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#2D2D2D] inline-block border border-white/10" />Свободен
                </span>
                {bookedAnyTime.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-500 inline-block" />Занят
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-green-500 inline-block" />Выбран вами
                </span>
              </div>

              <AnimatePresence>
                {selectedTable && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-3 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 border ${
                      bookedAtTime.includes(selectedTable)
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                    }`}
                  >
                    {bookedAtTime.includes(selectedTable)
                      ? `⚠️ Стол №${selectedTable} занят в ${time} — выберите другое время или стол`
                      : `✅ Выбран стол №${selectedTable}`
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedTable && (
                <p className="text-sp-cream/30 text-xs mt-2">
                  Необязательно — если не выберете, мы подберём лучшее место
                </p>
              )}
            </motion.div>

            {/* Step 3 — Guest info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-sp-dark rounded-2xl p-6 border border-white/5"
            >
              <h2 className="text-sp-cream font-semibold mb-5 flex items-center gap-2">
                <User size={17} className="text-sp-orange" />
                Ваши данные
              </h2>
              <div className="flex flex-col gap-4">
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
                  <label className="form-label">Количество гостей</label>
                  <select
                    value={form.guests}
                    onChange={e => setForm(v => ({ ...v, guests: e.target.value }))}
                    className="form-input"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(n => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'человек' : n < 5 ? 'человека' : 'человек'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Occupied slots */}
            {date && dayReservations.length > 0 && (
              <div className="bg-sp-dark rounded-2xl p-5 border border-white/5">
                <h3 className="text-sp-cream/60 text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock size={13} className="text-sp-orange" />
                  Занятые столы на {new Date(date + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {dayReservations.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-xs bg-white/3 rounded-lg px-3 py-1.5">
                      <span className="text-sp-cream/60">Стол №{r.table_number}</span>
                      <span className="text-sp-cream/40">{r.time} · {r.guests_count} чел.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              className="btn-primary text-base py-4 relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="inline-block">⏳</motion.span>
                  Отправляем...
                </span>
              ) : '🗓️ Забронировать стол'}
            </button>

            <p className="text-sp-cream/30 text-xs text-center">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <a href="/privacy" className="underline hover:text-sp-cream/50 transition-colors">
                политикой конфиденциальности
              </a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
