import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, ExternalLink, MessageCircle } from 'lucide-react';

const YANDEX_ORG_ID = '172085958854';
const YANDEX_MAPS_URL = `https://yandex.ru/maps/org/sol_i_perets/${YANDEX_ORG_ID}/reviews/`;

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
            <div className="bg-white rounded-2xl overflow-hidden h-[600px] lg:h-[700px] border border-white/10">
              <iframe
                src={`https://yandex.ru/maps-reviews-widget/${YANDEX_ORG_ID}?theme=dark`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Отзывы на Яндекс.Картах"
              />
            </div>
          </div>

          <div>
            <div className="bg-sp-dark rounded-2xl p-6 sticky top-24 border border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Star size={24} className="text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-sp-cream font-bold">Яндекс.Карты</h2>
                  <p className="text-sp-cream/50 text-xs">Рейтинг и отзывы</p>
                </div>
              </div>

              <p className="text-sp-cream/70 text-sm leading-relaxed mb-6">
                Мы ценим мнение каждого гостя. Все отзывы публикуются на Яндекс.Картах — честные и неподдельные.
              </p>

              <a
                href={YANDEX_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              >
                <Star size={16} />
                Все отзывы на Яндекс.Картах
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

              <div className="mt-6 pt-5 border-t border-white/10">
                <a
                  href="https://yandex.ru/maps/org/sol_i_perets/172085958854/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sp-cream/40 hover:text-sp-orange text-xs transition-colors"
                >
                  <ExternalLink size={12} />
                  Открыть на Яндекс.Картах
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
