import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, MessageCircle, ExternalLink } from 'lucide-react';

const YANDEX_ORG_ID = '172085958854';
const YANDEX_MAPS_URL = `https://yandex.ru/maps/org/sol_i_perets/${YANDEX_ORG_ID}/reviews/`;

function YandexReviewsWidget({ height = '700px' }: { height?: string }) {
  return (
    <div style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }} className="rounded-2xl">
      <iframe
        style={{ width: '100%', height: '100%', border: 0, borderRadius: '8px', boxSizing: 'border-box' }}
        src={`https://yandex.ru/maps-reviews-widget/${YANDEX_ORG_ID}?comments`}
        title="Отзывы на Яндекс.Картах"
        loading="lazy"
      />
      <a
        href={YANDEX_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          boxSizing: 'border-box', textDecoration: 'none', color: '#b3b3b3',
          fontSize: '10px', fontFamily: 'YS Text, sans-serif',
          padding: '0 20px', position: 'absolute', bottom: '8px',
          width: '100%', textAlign: 'center', left: 0,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'block', maxHeight: '14px', whiteSpace: 'nowrap',
        }}
      >
        Соль и Перец на карте Химок — Яндекс Карты
      </a>
    </div>
  );
}

export default function Reviews() {
  return (
    <div className="min-h-screen bg-sp-darkest pt-20">
      <Helmet>
        <title>Отзывы — Соль и Перец | Сходня</title>
        <meta name="description" content="Отзывы гостей кафе Соль и Перец в Сходне на Яндекс.Картах. Оставьте своё мнение о посещении, еде и обслуживании." />
      </Helmet>

      <div className="bg-sp-dark py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl text-sp-cream font-bold mb-2">Отзывы</h1>
            <p className="text-sp-cream/50 text-sm">Реальные отзывы наших гостей с Яндекс.Карт</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <YandexReviewsWidget height="700px" />
            </div>
          </div>

          <div>
            <div className="bg-sp-dark rounded-2xl p-6 sticky top-24 border border-white/5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Star size={24} className="text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-sp-cream font-bold">Яндекс.Карты</h2>
                  <p className="text-sp-cream/50 text-xs">Рейтинг и отзывы</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-sm text-sp-cream/70 leading-relaxed">
                Мы ценим мнение каждого гостя. Все отзывы публикуются на Яндекс.Картах — честные и неподдельные.
              </div>

              <a
                href={YANDEX_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Star size={16} />
                Все отзывы
              </a>

              <a
                href={YANDEX_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Оставить отзыв
              </a>

              <a
                href="https://yandex.ru/maps/org/sol_i_perets/172085958854/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sp-cream/30 hover:text-sp-orange text-xs transition-colors pt-2 border-t border-white/5"
              >
                <ExternalLink size={12} />
                Открыть на Яндекс.Картах
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
