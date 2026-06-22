import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
    if (typeof window !== 'undefined' && (window as any).ym) {
        (window as any).ym(109035396, 'reachGoal', 'cookie_accepted');
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-sp-darkest/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sp-cream">
          
          <div className="flex-1 text-sm md:text-base leading-relaxed">
            <p className="mb-2 font-semibold text-sp-orange">Мы используем файлы cookie</p>
            <p className="text-sp-cream/70">
              Это помогает нам улучшать работу сайта и подбирать для вас лучшие блюда. 
              Продолжая пользоваться сайтом, вы соглашаетесь с нашей{' '}
              <a href="/privacy" className="text-sp-orange hover:underline transition-colors">
                Политикой конфиденциальности
              </a>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="text-sp-cream/50 hover:text-sp-cream text-sm px-4 py-2.5 transition-colors"
            >
              Отклонить
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-2 bg-sp-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-orange-900/20 active:scale-95"
            >
              <Check size={18} />
              Принять
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}