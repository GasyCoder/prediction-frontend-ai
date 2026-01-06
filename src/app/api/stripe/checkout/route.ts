import { NextRequest, NextResponse } from 'next/server';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

const getOrigin = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  if (origin) {
    return origin;
  }
  const host = request.headers.get('host');
  return host ? `https://${host}` : 'http://localhost:3000';
};

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe n’est pas configuré. Ajoutez STRIPE_SECRET_KEY.' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const predictionId = `${body?.predictionId ?? ''}`.trim();
  const amount = Number(body?.amount);
  const currency = `${body?.currency ?? ''}`.toLowerCase();

  if (!predictionId || !Number.isFinite(amount) || amount <= 0 || !currency) {
    return NextResponse.json(
      { error: 'Paramètres de paiement invalides.' },
      { status: 400 }
    );
  }

  const unitAmount = ZERO_DECIMAL_CURRENCIES.has(currency)
    ? Math.round(amount)
    : Math.round(amount * 100);

  const origin = getOrigin(request);

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${origin}/result/${predictionId}?payment=success`);
  params.set('cancel_url', `${origin}/checkout/${predictionId}?payment=cancelled`);
  params.set('client_reference_id', predictionId);
  params.set('line_items[0][price_data][currency]', currency);
  params.set('line_items[0][price_data][product_data][name]', 'Analyse Predictly AI');
  params.set('line_items[0][price_data][product_data][description]', 'Accès immédiat aux résultats.');
  params.set('line_items[0][price_data][unit_amount]', `${unitAmount}`);
  params.set('line_items[0][quantity]', '1');
  params.set('metadata[prediction_id]', predictionId);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? 'Impossible de créer la session Stripe.' },
      { status: response.status }
    );
  }

  return NextResponse.json({ url: data.url });
}
