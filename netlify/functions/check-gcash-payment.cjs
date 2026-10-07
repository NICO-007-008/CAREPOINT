// Looks up a PayMongo Payment Intent and reports its status.
// The order is only created in the app when status === 'succeeded'.
exports.handler = async (event) => {
  const key = process.env.PAYMONGO_SECRET_KEY;
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!key || !id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing key or id' }) };
  }
  try {
    const res = await fetch('https://api.paymongo.com/v1/payment_intents/' + encodeURIComponent(id), {
      headers: { Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64') },
    });
    const data = await res.json();
    const status = data && data.data && data.data.attributes ? data.data.attributes.status : null;
    return { statusCode: res.ok ? 200 : res.status, body: JSON.stringify({ status }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
