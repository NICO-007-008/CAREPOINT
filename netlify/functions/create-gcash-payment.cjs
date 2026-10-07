// Creates a PayMongo Payment Intent + GCash Payment Method, attaches them,
// and returns the GCash redirect URL. The secret key stays on the server.
// CORS headers are included because the Android app (origin https://localhost)
// calls this function cross-origin.
const API = 'https://api.paymongo.com/v1';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) return json(500, { error: 'PAYMONGO_SECRET_KEY is not set on the server.' });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'),
  };

  const call = async (path, payload) => {
    const res = await fetch(API + path, { method: 'POST', headers, body: JSON.stringify({ data: { attributes: payload } }) });
    const data = await res.json();
    if (!res.ok) {
      const msg = (data.errors && data.errors[0] && data.errors[0].detail) || 'PayMongo error';
      throw new Error(msg);
    }
    return data.data;
  };

  try {
    const { amount, referenceId, returnUrl } = JSON.parse(event.body || '{}');
    if (!amount || !returnUrl) return json(400, { error: 'Missing amount or returnUrl.' });

    // 1) Payment Intent (amount is in centavos)
    const intent = await call('/payment_intents', {
      amount: Math.round(Number(amount) * 100),
      currency: 'PHP',
      payment_method_allowed: ['gcash'],
      capture_type: 'automatic',
      description: 'CarePoint order ' + (referenceId || ''),
    });

    // 2) GCash Payment Method
    const method = await call('/payment_methods', { type: 'gcash' });

    // 3) Attach -> returns the GCash redirect URL
    const attached = await call('/payment_intents/' + intent.id + '/attach', {
      payment_method: method.id,
      return_url: returnUrl,
    });

    const checkoutUrl =
      attached.attributes.next_action && attached.attributes.next_action.redirect
        ? attached.attributes.next_action.redirect.url
        : null;
    if (!checkoutUrl) return json(502, { error: 'PayMongo did not return a GCash redirect URL.' });

    return json(200, { intentId: intent.id, checkoutUrl });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
