'use client';

import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

interface Option {
  id: number;
  value: string;
  label: string;
}

interface Question {
  id: number;
  key: string;
  label: string;
  type: 'scale' | 'choice' | 'text';
  step: number;
  options: Option[];
}

interface Questionnaire {
  id: number;
  title: string;
  questions: Question[];
}

export default function Wizard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.push('/login');
      return;
    }
    fetchQuestionnaire();
  }, [slug]);

  const fetchQuestionnaire = async () => {
    try {
      const res = await apiFetch(`/categories/${slug}/questionnaire`);
      const data = await res.json();
      setQuestionnaire(data.questionnaire);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !questionnaire) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Initialisation...</div>;

  const questions = questionnaire.questions.filter(q => q.step === currentStep);
  const totalSteps = Math.max(...questionnaire.questions.map(q => q.step));

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create prediction request and Save answers
      setSaving(true);
      try {
        const createRes = await apiFetch('/predictions', {
          method: 'POST',
          body: JSON.stringify({ category_slug: slug }),
        });
        const reqData = await createRes.json();
        
        const formattedAnswers = Object.entries(answers).map(([qid, val]) => ({
          question_id: parseInt(qid),
          value: val,
        }));

        await apiFetch(`/predictions/${reqData.id}/answers`, {
          method: 'POST',
          body: JSON.stringify({ answers: formattedAnswers }),
        });

        router.push(`/checkout/${reqData.id}`);
      } catch (err) {
        alert('Erreur lors de la sauvegarde');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-4xl font-black">{questionnaire.title}</h1>
            <span className="text-purple-400 font-mono">Étape {currentStep} sur {totalSteps}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-12">
          {questions.map((q) => (
            <div key={q.id} className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">{q.label}</h3>
              
              {q.type === 'scale' && (
                <div className="flex justify-between gap-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAnswers({ ...answers, [q.id]: val })}
                      className={`flex-1 py-4 rounded-xl border transition-all ${
                        answers[q.id] === val 
                        ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                      className={`p-4 text-left rounded-xl border transition-all ${
                        answers[q.id] === opt.value 
                        ? 'bg-purple-600 border-purple-400' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-between gap-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 font-bold disabled:opacity-30"
            disabled={currentStep === 1}
          >
            Précédent
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {saving ? 'Sauvegarde...' : currentStep === totalSteps ? 'Finaliser' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}
