'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Checkout({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await apiFetch(`/predictions/${id}`);
      const data = await res.json();
      setRequest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      const res = await apiFetch(`/predictions/${id}/checkout`, { method: 'POST' });
      if (res.ok) {
        router.push(`/fakepay?request_id=${id}`);
      }
    } catch (err) {
      alert('Erreur checkout');
    }
  };

  if (loading || !request) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-3xl p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
        
        <h1 className="text-3xl font-black mb-2">Finalisez votre commande</h1>
        <p className="text-gray-400 mb-10">Accédez à votre analyse d'IA instantanément.</p>

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

        <button
          onClick={handlePay}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-5 rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20"
        >
          Procéder au paiement
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          Paiement sécurisé via FakePay Simulator
        </p>
      </div>
    </div>
  );
}
