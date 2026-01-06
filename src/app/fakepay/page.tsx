'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

function FakePayContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request_id');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const router = useRouter();

  const handleSimulatePayment = async (success: boolean) => {
    setStatus('processing');
    
    try {
      // 1. Initiate payment to get tx_ref
      const initRes = await apiFetch('/payments/fake/initiate', {
        method: 'POST',
        body: JSON.stringify({ prediction_request_id: requestId })
      });
      const { tx_ref } = await initRes.json();

      // 2. Call our own webhook (acting as the provider)
      // Note: In real life, the provider's server calls our server.
      // Here we simulate it from the client for simplicity.
      const webhookRes = await apiFetch('/payments/fake/webhook', {
        method: 'POST',
        headers: {
          'X-FakePay-Signature': 'SimulatedSignature' // The engine bypasses signature check in local dev usually, or we should handle it
        },
        body: JSON.stringify({
          tx_ref: tx_ref,
          status: success ? 'succeeded' : 'failed'
        })
      });

      if (webhookRes.ok) {
        setStatus('done');
        setTimeout(() => {
          router.push(success ? `/result/${requestId}` : '/history');
        }, 1500);
      }
    } catch (err) {
      alert('Simulation error');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="max-w-md w-full border-2 border-gray-100 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">FP</div>
          <span className="text-2xl font-black tracking-tight italic">FakePay <span className="text-gray-400 font-normal">Simulator</span></span>
        </div>

        {status === 'processing' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-bold">Traitement de la transaction...</p>
          </div>
        ) : status === 'done' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 animate-bounce">✓</div>
            <p className="text-xl font-bold text-green-600">Paiement Accepté !</p>
            <p className="text-gray-500 mt-2">Redirection vers vos résultats...</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-2">Montant à régler</p>
              <p className="text-4xl font-black">2 000 MGA</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleSimulatePayment(true)}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                SIMULER SUCCÈS
              </button>
              <button
                onClick={() => handleSimulatePayment(false)}
                className="w-full bg-white border-2 border-red-100 text-red-500 font-bold py-5 rounded-2xl hover:bg-red-50 transition-all"
              >
                SIMULER ÉCHEC
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function FakePay() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FakePayContent />
    </Suspense>
  );
}
