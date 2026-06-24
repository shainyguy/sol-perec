import { Plus, Clock, Flame } from 'lucide-react';
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

export default function MenuCard({ item, compact, hideCart: _hideCart }: MenuCardProps) {
  const handleAdd = () => {
    cartStore.add({ id: item.id, name: item.name, price: item.price, image_url: '' });
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-sp-dark/80 rounded-xl border border-white/5 overflow-hidden group"
      >
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sp-cream text-sm font-semibold leading-tight flex-1">{item.name}</h4>
            <span className="text-sp-orange font-bold whitespace-nowrap">{item.price.toLocaleString('ru-RU')} ₽</span>
          </div>
          {item.description && <p className="text-sp-cream/40 text-xs mt-1 line-clamp-1">{item.description}</p>}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1">
              {item.is_special && <span className="text-[10px] text-sp-orange">⭐</span>}
              {item.is_gluten_free && <span className="text-[10px] text-green-400/60">БГ</span>}
              {item.is_lactose_free && <span className="text-[10px] text-blue-400/60">БЛ</span>}
            </div>
            {item.is_bar ? (
              <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${item.category === 'Безалкогольное' ? 'text-sp-cream/40 border-white/10' : 'text-red-400 border-red-500/40'}`}>
                {item.category === 'Безалкогольное' ? 'В зале' : '18+'}
              </span>
            ) : (
              <button onClick={handleAdd} className="bg-sp-orange/20 hover:bg-sp-orange text-sp-orange hover:text-white rounded-full p-1.5 transition-all" aria-label={`Добавить ${item.name} в корзину`}>
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="menu-card group"
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.is_special && <span className="text-sp-orange text-sm">⭐</span>}
              <h3 className="text-sp-cream font-bold text-lg leading-tight">{item.name}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.is_gluten_free && <span className="text-[10px] bg-green-500/10 text-green-400/70 px-1.5 py-0.5 rounded">Без глютена</span>}
              {item.is_lactose_free && <span className="text-[10px] bg-blue-500/10 text-blue-400/70 px-1.5 py-0.5 rounded">Без лактозы</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {item.original_price && item.original_price > item.price && (
              <div className="text-sp-cream/30 text-xs line-through">{item.original_price.toLocaleString('ru-RU')} ₽</div>
            )}
            <div className="text-sp-orange font-bold text-2xl tracking-tight">{item.price.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        {item.description && (
          <p className="text-sp-cream/50 text-sm leading-relaxed mb-3">{item.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-sp-cream/40 mb-4">
          {item.calories && <span className="flex items-center gap-1"><Flame size={11} />{item.calories} ккал</span>}
          {item.cook_time && <span className="flex items-center gap-1"><Clock size={11} />{item.cook_time} мин</span>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {item.is_bar ? (
            <span className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-lg ${item.category === 'Безалкогольное' ? 'text-sp-cream/40 border-white/10' : 'text-red-400 border-red-500/30'}`}>
              {item.category !== 'Безалкогольное' && <span className="text-sm">🔞</span>}
              {item.category === 'Безалкогольное' ? 'В зале' : '18+'}
            </span>
          ) : (
            <span />
          )}
          {!item.is_bar && (
            <button onClick={handleAdd} className="btn-add">
              <Plus size={16} />
              В корзину
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
