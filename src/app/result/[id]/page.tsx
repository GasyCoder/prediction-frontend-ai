'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function Result({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, [id]);

  const init = async () => {
    setLoading(true);
    try {
      // 1. Check if already generated
      const res = await apiFetch(`/predictions/${id}`);
      const data = await res.json();
      
      if (data.result) {
        setRequest(data);
      } else {
        // 2. Not generated, run it
        setRunning(true);
        const runRes = await apiFetch(`/predictions/${id}/run`, { method: 'POST' });
        if (runRes.ok) {
          const finalRes = await apiFetch(`/predictions/${id}`);
          setRequest(await finalRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  if (loading || running) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-24 h-24 border-t-4 border-purple-500 border-solid rounded-full animate-spin mb-8"></div>
        <h1 className="text-3xl font-bold mb-4">L'IA prépare votre analyse...</h1>
        <p className="text-gray-400 max-w-sm">Nos algorithmes traitent vos réponses pour générer des prédictions précises.</p>
      </div>
    );
  }

  const rawResult = request?.result?.result_json;
  let resJson: any = rawResult;
  if (typeof rawResult === 'string') {
    try {
      resJson = JSON.parse(rawResult);
    } catch (err) {
      console.error('Failed to parse result_json', err);
      resJson = null;
    }
  }
  const suggestions = Array.isArray(resJson?.suggestions) ? resJson.suggestions : [];
  const nextSteps = Array.isArray(resJson?.next_steps) ? resJson.next_steps : [];
  const profile = resJson?.profile ?? 'Analyse personnalisée';
  const workEnvironment = resJson?.work_environment ?? 'Détails non disponibles pour le moment.';
  const disclaimer = resJson?.disclaimer ?? 'Résultats générés automatiquement, à utiliser comme guide.';
  const categoryName = request?.category?.name ?? 'Catégorie personnalisée';
  const createdAt = request?.created_at ? new Date(request.created_at).toLocaleDateString() : null;
  const hasResults = suggestions.length > 0 || nextSteps.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2">
            ← Retour
          </Link>
          <div className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full border border-green-500/20 text-sm font-bold">
            Analyse Terminée
          </div>
        </div>

        <header className="mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-purple-400 mb-4">Analyse IA</p>
          <h1 className="text-5xl font-black mb-4">Votre Profil : {profile}</h1>
          <p className="text-xl text-gray-400">{workEnvironment}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">Catégorie : {categoryName}</span>
            {createdAt ? (
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">Créée le {createdAt}</span>
            ) : null}
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10">Basé sur vos réponses</span>
          </div>
        </header>

        {!hasResults ? (
          <div className="mb-16 bg-white/5 border border-dashed border-white/10 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Résultats indisponibles</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Nous n'avons pas reçu de suggestions pour cette analyse. Réessayez dans quelques instants
              ou relancez une nouvelle analyse.
            </p>
            <div className="mt-6">
              <Link
                href="/history"
                className="inline-flex items-center justify-center bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                Retour à l'historique
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                💡 Suggestions
              </h2>
              {suggestions.length === 0 ? (
                <p className="text-gray-400">Aucune suggestion disponible pour le moment.</p>
              ) : (
                <ul className="space-y-4">
                  {suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="text-purple-500">•</span> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">🎯 Prochaines étapes</h2>
              {nextSteps.length === 0 ? (
                <p className="text-gray-400">Aucune prochaine étape définie.</p>
              ) : (
                <ul className="space-y-4">
                  {nextSteps.map((s: string, i: number) => (
                    <li key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="p-8 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center">
          <p className="text-gray-500 italic uppercase tracking-widest text-xs">
            {disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
