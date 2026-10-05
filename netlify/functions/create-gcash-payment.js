export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { amount, referenceId } = JSON.parse(event.body || '{}');

    // PayMongo Secret Key from Netlify env
    const paymongoSecret = process.env.PAYMONGO_SECRET_KEY;

    if (!paymongoSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'PAYMONGO_SECRET_KEY is missing in Netlify settings' }),
      };
    }

    // PayMongo requires amount in centavos (integer). User sends pesos.
    const pesoAmount = Number(amount) || 100;
    const centavos = Math.round(pesoAmount * 100);

    const url = 'https://api.paymongo.com/v1/sources';
    const auth = 'Basic ' + Buffer.from(paymongoSecret + ':').toString('base64');

    const payload = {
      data: {
        attributes: {
          type: 'gcash',
          amount: centavos,
          currency: 'PHP',
          redirect: {
            success: `${process.env.URL || 'http://localhost:8888'}/#success`,
            failed: `${process.env.URL || 'http://localhost:8888'}/#failure`,
          },
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayMongo error:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: result.errors?.[0]?.detail || 'PayMongo request failed' }),
      };
    }

    // Source response has checkout_url or redirect URL depending on PayMongo version
    const sourceData = result.data?.attributes || result.data || {};
    const checkoutUrl =
      sourceData.redirect?.checkout_url ||
      sourceData.redirect?.url ||
      sourceData.url ||
      (result.data?.attributes?.type === 'gcash' ? null : null);

    // If PayMongo returns a direct checkout URL in the source, use it.
    // Otherwise the frontend can construct the PayMongo checkout using source ID.
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        checkoutUrl: checkoutUrl,
        sourceId: result.data?.id || result.data?.attributes?.id,
        amount: pesoAmount,
      }),
    };
  } catch (error) {
    console.error('PayMongo Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
