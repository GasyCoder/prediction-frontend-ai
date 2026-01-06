'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Predictly AI
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/history" className="text-gray-400 hover:text-white transition-colors">Historique</Link>
            {auth.isLoggedIn() ? (
              <button 
                onClick={handleLogout}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                Déconnexion
              </button>
            ) : (
              <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg font-medium">
                S'inscrire
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
            Anticipez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">futur</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Utilisez la puissance de notre IA pour analyser vos profils et obtenir des prédictions personnalisées sur vos études, votre carrière et plus encore.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 flex items-center gap-3">
             Nos services de prédiction
            <div className="h-px bg-white/10 flex-1"></div>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(n => (
                <div key={n} className="h-64 bg-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/wizard/${cat.slug}`}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-[1.01] hover:border-purple-500/50"
                >
                  <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 group-hover:opacity-100 transition-opacity">
                    ✨
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{cat.name}</h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all">
                    Commencer l'analyse <span className="text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
