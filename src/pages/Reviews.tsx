import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, MessageCircle, ExternalLink, ChevronRight } from 'lucide-react';

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
            <p className="text-sp-cream/50">Реальные отзывы наших гостей на Яндекс.Картах</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-sp-orange/10 to-sp-terracotta/5 border border-sp-orange/20 rounded-3xl p-8 md:p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
              <Star size={40} className="text-yellow-500" />
            </div>

            <h2 className="font-display text-3xl md:text-4xl text-sp-cream font-bold mb-3">
              Наш рейтинг на Яндекс.Картах
            </h2>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={22} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sp-cream/40 text-sm">4.8</span>
            </div>

            <p className="text-sp-cream/60 max-w-md mx-auto mb-8 leading-relaxed">
              Мы благодарны каждому гостю за тёплые слова. 
              Все отзывы публикуются на Яндекс.Картах — честные, живые и неподдельные.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={YANDEX_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Читать все отзывы
                <ChevronRight size={18} />
              </a>
              <a
                href={YANDEX_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-4 inline-flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Оставить отзыв
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <a
              href="https://yandex.ru/maps/org/sol_i_perets/172085958854/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sp-cream/30 hover:text-sp-orange text-sm transition-colors"
            >
              <ExternalLink size={14} />
              Страница на Яндекс.Картах
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 grid md:grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: '⭐', title: '4.8', desc: 'Средняя оценка' },
              { icon: '💬', title: '100+', desc: 'Отзывов на Яндекс.Картах' },
              { icon: '🏆', title: 'Рекомендуют', desc: '95% гостей возвращаются' },
            ].map((s, i) => (
              <div key={i} className="bg-sp-dark rounded-2xl p-6 border border-white/5">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-sp-cream font-bold text-xl">{s.title}</div>
                <div className="text-sp-cream/40 text-sm">{s.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
