'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function History() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiFetch('/predictions');
      const data = await res.json();
      setPredictions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-4xl font-black">Mon Historique</h1>
          <Link href="/" className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl hover:bg-white/10 transition-all">
            Nouvelle analyse
          </Link>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <div key={n} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-gray-400">Aucune prédiction pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {predictions.map((p) => (
              <Link 
                key={p.id} 
                href={p.status === 'done' ? `/result/${p.id}` : p.status === 'draft' ? `/wizard/${p.id}` : `/checkout/${p.id}`}
                className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div>
                  <div className="text-sm text-gray-400 mb-1">{new Date(p.created_at).toLocaleDateString()}</div>
                  <h3 className="text-xl font-bold">Analyse #{p.id}</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    p.status === 'done' ? 'bg-green-500/10 text-green-500' : 
                    p.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {p.status}
                  </span>
                  <span className="group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
