'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Checkout({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await apiFetch(`/predictions/${id}`);
      if (!res.ok) {
        setError('Impossible de charger la commande.');
        return;
      }
      const data = await res.json();
      setRequest(data);
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await apiFetch(`/predictions/${id}/checkout`, { method: 'POST' });
      if (!res.ok) {
        setError('Impossible de préparer le paiement. Réessayez.');
        return;
      }

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictionId: id,
          amount: request?.total_amount,
          currency: request?.currency,
        }),
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok || !stripeData?.url) {
        setError(stripeData?.error ?? 'Impossible de lancer Stripe.');
        return;
      }
      router.push(stripeData.url);
    } catch (err) {
      setError('Erreur de paiement. Vérifiez votre connexion.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>;
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">
          <h1 className="text-2xl font-bold mb-4">Commande introuvable</h1>
          <p className="text-gray-400 mb-6">{error ?? 'Veuillez relancer votre analyse.'}</p>
          <button
            onClick={() => router.push('/history')}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
          >
            Retour à l'historique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
          
          <h1 className="text-3xl font-black mb-2">Finalisez votre commande</h1>
          <p className="text-gray-400 mb-10">
            Paiement sécurisé via Stripe. Utilisez une carte de test pour valider votre parcours client.
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center py-4 border-b border-white/5">
              <span className="text-gray-400">Service</span>
              <span className="font-bold">Analyse de profil - {request.category?.name}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-400">Total à payer</span>
              <span className="text-3xl font-black text-white">{request.total_amount} {request.currency}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300 mb-8">
            <p className="font-semibold text-white mb-3">Cartes de test Stripe</p>
            <p>✅ Paiement accepté : 4242 4242 4242 4242</p>
            <p>❌ Paiement refusé : 4000 0000 0000 0002</p>
            <p className="mt-3 text-gray-400">Utilisez une date future (ex: 12/34) et un CVC valide.</p>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20 disabled:opacity-60"
          >
            {processing ? 'Redirection vers Stripe...' : 'Procéder au paiement'}
          </button>

          {error ? (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          ) : (
            <p className="mt-8 text-center text-sm text-gray-500">
              Paiement sécurisé via Stripe (mode test)
            </p>
          )}
        </div>

        <aside className="bg-gradient-to-br from-[#121218] to-[#0b0b0f] border border-white/10 rounded-3xl p-10">
          <h2 className="text-2xl font-bold mb-6">Votre parcours Predictly</h2>
          <ol className="space-y-5 text-gray-300">
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-semibold text-white">1</span>
              <div>
                <p className="font-semibold text-white">Réponses collectées</p>
                <p className="text-sm text-gray-400">Vos choix alimentent notre modèle IA spécialisé.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-semibold text-white">2</span>
              <div>
                <p className="font-semibold text-white">Paiement sécurisé</p>
                <p className="text-sm text-gray-400">Stripe chiffre vos données et valide la transaction.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-semibold text-white">3</span>
              <div>
                <p className="font-semibold text-white">Résultats instantanés</p>
                <p className="text-sm text-gray-400">Suggestions, prochaines étapes et synthèse claire.</p>
              </div>
            </li>
          </ol>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">Besoin d'aide ?</p>
            <p className="text-gray-400">
              Après paiement, vos résultats seront immédiatement accessibles depuis votre historique.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
