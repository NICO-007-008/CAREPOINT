import { Xendit } from 'xendit-node';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { amount, referenceId } = JSON.parse(event.body || '{}');

    // Reads the key you configured in your Netlify Dashboard environment variables
    const xenditSecretKey = process.env.XENDIT_SECRET_KEY;

    if (!xenditSecretKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'XENDIT_SECRET_KEY is missing in Netlify settings' }),
      };
    }

    const xenditClient = new Xendit({ secretKey: xenditSecretKey });
    const { PaymentRequest } = xenditClient;

    const response = await PaymentRequest.createPaymentRequest({
      data: {
        referenceId: referenceId || `CAREPOINT-${Date.now()}`,
        currency: 'PHP',
        amount: Number(amount) || 100,
        paymentMethod: {
          type: 'EWALLET',
          ewallet: {
            channelCode: 'GCASH',
            channelProperties: {
              successReturnUrl: `${process.env.URL || 'http://localhost:8888'}/#success`,
              failureReturnUrl: `${process.env.URL || 'http://localhost:8888'}/#failure`,
            },
          },
        },
      },
    });

    const actions = response.actions || [];
    const checkoutUrl =
      actions.find((a) => a.urlType === 'WEB')?.url ||
      actions.find((a) => a.urlType === 'DEEPLINK')?.url;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        checkoutUrl: checkoutUrl,
        id: response.id,
      }),
    };
  } catch (error) {
    console.error('Xendit Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
