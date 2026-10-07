// Looks up a PayMongo Payment Intent and reports its status.
// The order is only created in the app when status === 'succeeded'.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };

  const key = process.env.PAYMONGO_SECRET_KEY;
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!key || !id) return reply(400, { error: 'Missing key or id' });

  try {
    const res = await fetch('https://api.paymongo.com/v1/payment_intents/' + encodeURIComponent(id), {
      headers: { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64') },
    });
    const data = await res.json();
    const status = data && data.data && data.data.attributes ? data.data.attributes.status : null;
    return reply(res.ok ? 200 : res.status, { status });
  } catch (e) {
    return reply(500, { error: e.message });
  }
};
