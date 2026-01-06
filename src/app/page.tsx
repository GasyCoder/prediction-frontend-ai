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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsLoggedIn(auth.isLoggedIn());
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
    setIsLoggedIn(false);
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
            {isLoggedIn ? (
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

      {/* Pricing */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">Abonnements</p>
              <h2 className="text-3xl md:text-4xl font-black">Choisissez votre pack de crédits</h2>
              <p className="text-gray-400 mt-4 max-w-2xl">
                Chaque crédit débloque une prédiction IA. Commencez gratuitement, puis passez à un plan pro
                pour des analyses plus poussées et un suivi prioritaire.
              </p>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center justify-center bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
            >
              Voir mon historique
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-400">Découverte</p>
                <h3 className="text-3xl font-bold mt-2">300 crédits</h3>
                <p className="text-gray-400 mt-2">Parfait pour tester Predictly AI.</p>
              </div>
              <div className="text-4xl font-black">Gratuit</div>
              <ul className="space-y-3 text-gray-300">
                <li>• 1 analyse complète incluse</li>
                <li>• Suggestions clés + prochaines étapes</li>
                <li>• Historique accessible 7 jours</li>
              </ul>
              <button className="mt-auto bg-white/10 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                Commencer gratuitement
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/40 border border-purple-500/40 rounded-3xl p-8 flex flex-col gap-6 shadow-xl shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-widest text-purple-200">Pro</p>
                  <h3 className="text-3xl font-bold mt-2">1 500 crédits</h3>
                </div>
                <span className="text-xs uppercase tracking-widest bg-white/10 text-white px-3 py-1 rounded-full">Recommandé</span>
              </div>
              <div className="text-4xl font-black">29 € / mois</div>
              <ul className="space-y-3 text-gray-200">
                <li>• Jusqu’à 5 analyses premium</li>
                <li>• Résultats enrichis et conseils IA</li>
                <li>• Support prioritaire 7j/7</li>
              </ul>
              <button className="mt-auto bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all">
                Passer en Pro
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-400">Entreprise</p>
                <h3 className="text-3xl font-bold mt-2">Crédits illimités</h3>
                <p className="text-gray-400 mt-2">Pour équipes et établissements.</p>
              </div>
              <div className="text-4xl font-black">Sur devis</div>
              <ul className="space-y-3 text-gray-300">
                <li>• Accès multi-utilisateurs</li>
                <li>• SLA & reporting avancé</li>
                <li>• Onboarding personnalisé</li>
              </ul>
              <button className="mt-auto bg-white/10 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                Contacter l’équipe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
