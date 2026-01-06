'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

function FakePayContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request_id');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [amount, setAmount] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAmount = async () => {
      if (!requestId) return;
      try {
        const res = await apiFetch(`/predictions/${requestId}`);
        const data = await res.json();
        if (data?.total_amount && data?.currency) {
          setAmount(`${data.total_amount}`);
          setCurrency(data.currency);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAmount();
  }, [requestId]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitized = cardNumber.replace(/\s+/g, '');
    const success = sanitized === '4242424242424242';
    const declined = sanitized === '4000000000000002';

    if (declined) {
      await handleSimulatePayment(false);
      return;
    }

    await handleSimulatePayment(success);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full border border-white/10 rounded-3xl p-8 shadow-2xl bg-gradient-to-br from-[#12131a] to-[#0b0b0f]">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="text-2xl font-black tracking-tight italic">Stripe <span className="text-gray-400 font-normal">Test Checkout</span></span>
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
            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
              <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-2">Montant à régler</p>
              <p className="text-4xl font-black">{amount && currency ? `${amount} ${currency}` : 'Montant en cours de chargement...'}</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-gray-400">Nom sur la carte</label>
                <input
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  placeholder="Jenny Rosen"
                  className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Numéro de carte</label>
                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Expiration</label>
                  <input
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value)}
                    placeholder="12/34"
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">CVC</label>
                  <input
                    value={cardCvc}
                    onChange={(event) => setCardCvc(event.target.value)}
                    placeholder="123"
                    className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                <p className="font-semibold text-white mb-2">Cartes de test Stripe</p>
                <p>✅ Succès : 4242 4242 4242 4242</p>
                <p>❌ Refus : 4000 0000 0000 0002</p>
              </div>

              <button
                type="submit"
                disabled={status === 'processing'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-4 rounded-2xl hover:scale-[1.01] transition-all shadow-lg shadow-purple-500/30 disabled:opacity-60"
              >
                Payer maintenant
              </button>
            </form>
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
