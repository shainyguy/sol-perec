import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sp-darkest flex items-center justify-center p-4">
      <Helmet>
        <title>Страница не найдена — Соль и Перец</title>
      </Helmet>
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 opacity-30">404</div>
        <h1 className="font-display text-3xl text-sp-cream font-bold mb-3">Страница не найдена</h1>
        <p className="text-sp-cream/50 mb-8">Страница, которую вы ищете, не существует или была перемещена.</p>
        <Link to="/" className="btn-primary">На главную</Link>
      </div>
    </div>
  );
}
