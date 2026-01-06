'use client';

import { useEffect, useMemo, useState } from 'react';
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

const fallbackCategories: Category[] = [
  {
    id: 1,
    slug: 'orientation',
    name: 'Orientation académique',
    description: 'Analysez les options d’études et clarifiez votre prochaine étape.',
  },
  {
    id: 2,
    slug: 'carriere',
    name: 'Projection de carrière',
    description: 'Identifiez les trajectoires professionnelles qui correspondent à votre profil.',
  },
];

const stats = [
  { label: 'Prédictions générées', value: '48K+' },
  { label: 'Taux de satisfaction', value: '96%' },
  { label: 'Temps moyen', value: '2 min' },
];

const steps = [
  {
    title: 'Créez votre profil',
    description: 'Renseignez vos objectifs et votre contexte en quelques minutes.',
  },
  {
    title: 'L’IA analyse',
    description: 'Nos modèles croisent vos données avec des tendances fiables.',
  },
  {
    title: 'Recevez votre feuille de route',
    description: 'Obtenez des actions claires, des priorités et un plan de progression.',
  },
];

const plans = [
  {
    name: 'Découverte',
    credits: '300 crédits gratuits',
    price: '0 €',
    cadence: 'Pour démarrer sans engagement',
    features: ['1 analyse complète incluse', 'Suggestions clés + prochaines étapes', 'Historique accessible 7 jours'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    name: 'Pro',
    credits: '1 500 crédits / mois',
    price: '29 € / mois',
    cadence: 'Idéal pour un suivi continu',
    features: ['Jusqu’à 5 analyses premium', 'Résultats enrichis et conseils IA', 'Support prioritaire 7j/7'],
    cta: 'Passer en Pro',
    highlight: true,
  },
  {
    name: 'Entreprise',
    credits: 'Crédits illimités',
    price: 'Sur devis',
    cadence: 'Pour les équipes ambitieuses',
    features: ['Accès multi-utilisateurs', 'SLA & reporting avancé', 'Onboarding personnalisé'],
    cta: 'Contacter l’équipe',
    highlight: false,
  },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status}`);
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setErrorMessage('Chargement des catégories indisponible, voici une sélection par défaut.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setIsLoggedIn(false);
    router.refresh();
  };

  const displayedCategories = useMemo(() => {
    if (loading) {
      return [];
    }
    if (categories.length === 0) {
      return fallbackCategories;
    }
    return categories;
  }, [categories, loading]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-purple-500/30 blur-[140px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <nav className="relative border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Predictly</span> AI
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/history" className="text-gray-400 hover:text-white transition-colors">
              Historique
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg font-medium shadow-lg shadow-purple-500/30"
              >
                S'inscrire
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.2em] text-gray-300">
              IA prédictive de nouvelle génération
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-black leading-tight">
              Des prédictions <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">pro</span> pour vos
              décisions clés.
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-xl leading-relaxed">
              Transformez vos données en recommandations claires. Predictly AI combine analyses avancées et design premium pour guider vos choix d’études,
              carrière et projets personnels.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all"
              >
                Essayer maintenant
              </Link>
              <Link
                href="/history"
                className="px-6 py-3 rounded-xl border border-white/15 text-gray-200 hover:border-white/40 transition-all"
              >
                Voir un exemple
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Tableau de bord</span>
                <span>Mis à jour • Aujourd'hui</span>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-purple-300">Synthèse IA</p>
                <h3 className="mt-3 text-2xl font-bold">Votre trajectoire idéale</h3>
                <p className="mt-3 text-gray-300">
                  78% de probabilité d’alignement entre vos compétences et les secteurs les plus dynamiques sur 24 mois.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-gray-400">Score d'impact</p>
                    <p className="text-lg font-semibold text-white">8.6 / 10</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-gray-400">Crédits restants</p>
                    <p className="text-lg font-semibold text-white">280</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <p className="text-sm text-gray-400">Prochaines actions</p>
                <ul className="mt-3 space-y-3 text-gray-200">
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Compléter votre profil académique
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Lancer une nouvelle analyse carrière
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-pink-400" />
                    Comparer les parcours recommandés
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            Nos services de prédiction
            <div className="h-px bg-white/10 flex-1" />
          </h2>
          {errorMessage && categories.length === 0 && (
            <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-amber-100">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8"
                >
                  <div className="h-6 w-32 rounded-full bg-white/10 animate-pulse" />
                  <div className="mt-6 h-5 w-4/5 rounded-full bg-white/10 animate-pulse" />
                  <div className="mt-3 h-5 w-3/5 rounded-full bg-white/10 animate-pulse" />
                  <div className="mt-10 h-10 w-40 rounded-full bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/wizard/${cat.slug}`}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-[1.01] hover:border-purple-500/50"
                >
                  <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 group-hover:opacity-100 transition-opacity">
                    ✨
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Analyse</p>
                  <h3 className="text-3xl font-bold mt-3 mb-4">{cat.name}</h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">{cat.description}</p>
                  <div className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all">
                    Commencer l'analyse <span className="text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="text-sm uppercase tracking-[0.4em] text-purple-300">0{index + 1}</div>
              <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
              <p className="mt-3 text-gray-300 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">Abonnements</p>
              <h2 className="text-3xl md:text-4xl font-black">Plans par crédits & abonnements</h2>
              <p className="text-gray-400 mt-4 max-w-2xl">
                Commencez avec 300 crédits gratuits, puis choisissez un abonnement adapté à votre rythme. Chaque crédit
                débloque une prédiction IA premium.
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
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlight
                    ? 'bg-gradient-to-br from-purple-900/60 to-blue-900/40 border border-purple-500/40 rounded-3xl p-8 flex flex-col gap-6 shadow-xl shadow-purple-500/20'
                    : 'bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6'
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={plan.highlight ? 'text-sm uppercase tracking-widest text-purple-200' : 'text-sm uppercase tracking-widest text-gray-400'}>
                      {plan.name}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{plan.credits}</h3>
                    <p className="text-gray-300 mt-2">{plan.cadence}</p>
                  </div>
                  {plan.highlight && (
                    <span className="text-xs uppercase tracking-widest bg-white/10 text-white px-3 py-1 rounded-full">Recommandé</span>
                  )}
                </div>
                <div className="text-4xl font-black">{plan.price}</div>
                <ul className="space-y-3 text-gray-200">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <button
                  className={
                    plan.highlight
                      ? 'mt-auto bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all'
                      : 'mt-auto bg-white/10 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-all'
                  }
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-purple-900/50 via-blue-900/40 to-black/80 p-10 md:p-14">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Prêt à démarrer ?</p>
                <h2 className="mt-4 text-3xl md:text-4xl font-black">Offrez-vous une prédiction premium dès aujourd’hui.</h2>
                <p className="mt-4 text-gray-300 max-w-xl">
                  Activez vos 300 crédits gratuits et accédez à des recommandations personnalisées en quelques minutes.
                </p>
              </div>
              <Link
                href="/register"
                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
