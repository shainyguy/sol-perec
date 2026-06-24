import { Plus, Clock, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cartStore } from '../lib/cart';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  calories?: number;
  cook_time?: number;
  is_gluten_free?: boolean;
  is_lactose_free?: boolean;
  is_bar?: boolean;
  is_active?: boolean;
  sort_order?: number;
  is_special?: boolean;
  original_price?: number;
}

interface MenuCardProps {
  item: MenuItem;
  compact?: boolean;
  hideCart?: boolean;
}

function SetCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="menu-card group relative overflow-hidden flex flex-col h-full">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-sp-orange" />
      <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-amber-500 to-sp-orange opacity-30" />
      <div className="flex flex-col h-full p-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-amber-500 to-sp-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Выгодный сет
          </span>
          {item.is_special && <Star size={12} className="text-amber-400 fill-amber-400" />}
        </div>
        <h3 className="text-sp-cream font-bold text-base leading-snug mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-sp-cream/55 text-xs leading-relaxed mb-3 line-clamp-3 flex-grow">{item.description}</p>
        )}
        <div className="mt-auto pt-3 border-t border-amber-500/15 flex items-center justify-between gap-2">
          <div>
            {item.original_price && item.original_price > item.price && (
              <div className="text-sp-cream/30 text-[10px] line-through leading-none">{item.original_price.toLocaleString('ru-RU')} ₽</div>
            )}
            <div className="text-amber-400 font-bold text-xl leading-tight">{item.price.toLocaleString('ru-RU')} ₽</div>
            <div className="text-amber-400/50 text-[10px]">на 2–3 персоны</div>
          </div>
          <button onClick={onAdd} className="btn-add bg-gradient-to-r from-amber-600 to-sp-orange border-0 text-white shadow-lg shadow-sp-orange/20 flex-shrink-0">
            <Plus size={14} />В корзину
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MenuCard({ item, compact, hideCart: _hideCart }: MenuCardProps) {
  const handleAdd = () => {
    cartStore.add({ id: item.id, name: item.name, price: item.price, image_url: '' });
  };

  if (item.category === 'Сеты') return <SetCard item={item} onAdd={handleAdd} />;

  // ── Compact (sidebar / quick list) ────────────────────────────────────────
  if (compact) {
    return (
      <motion.div whileHover={{ y: -1 }} className="bg-sp-dark/80 rounded-xl border border-white/5 overflow-hidden group">
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sp-cream text-sm font-semibold leading-tight flex-1 min-w-0">{item.name}</h4>
            <span className="text-sp-orange font-bold text-sm whitespace-nowrap flex-shrink-0">{item.price.toLocaleString('ru-RU')} ₽</span>
          </div>
          {item.description && <p className="text-sp-cream/40 text-xs mt-1 line-clamp-1">{item.description}</p>}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1 items-center">
              {item.is_special && <Star size={10} className="text-sp-orange fill-sp-orange" />}
              {item.is_gluten_free && <span className="text-[10px] text-green-400/60">БГ</span>}
              {item.is_lactose_free && <span className="text-[10px] text-blue-400/60">БЛ</span>}
            </div>
            {item.is_bar ? (
              <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${item.category === 'Безалкогольное' ? 'text-sp-cream/40 border-white/10' : 'text-red-400 border-red-500/40'}`}>
                {item.category === 'Безалкогольное' ? 'В зале' : '18+'}
              </span>
            ) : (
              <button onClick={handleAdd} className="bg-sp-orange/20 hover:bg-sp-orange text-sp-orange hover:text-white rounded-full p-1.5 transition-all" aria-label={`Добавить ${item.name}`}>
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Standard card — FIX: price is BELOW name, not next to it ─────────────
  const discount = item.original_price && item.original_price > item.price
    ? Math.round((1 - item.price / item.original_price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="menu-card group relative flex flex-col h-full overflow-hidden"
    >
      {/* Top gradient accent — animates on hover */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-sp-orange/30 to-transparent group-hover:via-sp-orange transition-all duration-500" />

      <div className="flex flex-col h-full p-4">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          {item.is_special && (
            <span className="inline-flex items-center gap-1 bg-sp-orange/12 border border-sp-orange/25 text-sp-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Star size={8} fill="currentColor" /> Хит
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {item.is_gluten_free && (
            <span className="text-[9px] bg-green-500/10 text-green-400/70 px-1.5 py-0.5 rounded-full border border-green-500/10">БГ</span>
          )}
          {item.is_lactose_free && (
            <span className="text-[9px] bg-blue-500/10 text-blue-400/70 px-1.5 py-0.5 rounded-full border border-blue-500/10">БЛ</span>
          )}
        </div>

        {/* Name — full width, no price next to it */}
        <h3 className="text-sp-cream font-bold text-sm md:text-[15px] leading-snug mb-2 flex-shrink-0">
          {item.name}
        </h3>

        {/* Description */}
        {item.description ? (
          <p className="text-sp-cream/45 text-xs leading-relaxed line-clamp-2 flex-grow mb-2">
            {item.description}
          </p>
        ) : (
          <div className="flex-grow" />
        )}

        {/* Meta row */}
        {(item.calories || item.cook_time) && (
          <div className="flex items-center gap-3 mb-3">
            {item.calories && (
              <span className="flex items-center gap-0.5 text-[10px] text-sp-cream/30">
                <Flame size={9} />{item.calories} ккал
              </span>
            )}
            {item.cook_time && (
              <span className="flex items-center gap-0.5 text-[10px] text-sp-cream/30">
                <Clock size={9} />{item.cook_time} мин
              </span>
            )}
          </div>
        )}

        {/* Price + action — always at bottom */}
        <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
          <div className="min-w-0">
            {discount > 0 && (
              <div className="text-sp-cream/25 text-[10px] line-through leading-none">
                {item.original_price!.toLocaleString('ru-RU')} ₽
              </div>
            )}
            <div className="text-sp-orange font-bold text-lg leading-tight tabular-nums">
              {item.price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {item.is_bar ? (
            <span className={`flex-shrink-0 text-[10px] font-bold border px-2 py-1 rounded-lg ${
              item.category === 'Безалкогольное'
                ? 'text-sp-cream/40 border-white/10'
                : 'text-red-400 border-red-500/30'
            }`}>
              {item.category === 'Безалкогольное' ? 'В зале' : '18+'}
            </span>
          ) : (
            <button
              onClick={handleAdd}
              className="btn-add flex-shrink-0"
              aria-label={`Добавить ${item.name} в корзину`}
            >
              <Plus size={14} />
              В корзину
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
