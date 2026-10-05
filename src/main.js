// Load Ionic
(async () => {
  const ionicPath = '/ionic.esm.js'
  await import(/* @vite-ignore */ ionicPath)
})()

// GCash Payment Handler (PayMongo)
async function payWithGCash(amount) {
  try {
    const response = await fetch('/.netlify/functions/create-gcash-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in PHP (pesos)
        referenceId: `CAREPOINT-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // PayMongo Source API returns checkoutUrl or sourceId
      // If checkoutUrl exists, redirect directly
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
      // Otherwise construct PayMongo checkout URL using sourceId
      else if (data.sourceId) {
        // PayMongo checkout URL format: https://checkout.paymongo.com/<source_id>
        window.location.href = `https://checkout.paymongo.com/${data.sourceId}`;
      }
      else {
        alert('GCash Payment Error: No checkout URL returned from PayMongo');
      }
    } else {
      alert('GCash Payment Error: ' + (data.error || 'Failed to initialize payment'));
    }
  } catch (err) {
    console.error('Payment Error:', err);
    alert('GCash Payment Error: Network error');
  }
}

// Attach event listener to your GCash button ID
document.addEventListener('DOMContentLoaded', () => {
  const gcashBtn = document.getElementById('gcash-pay-button');
  if (gcashBtn) {
    gcashBtn.addEventListener('click', () => payWithGCash(100)); // Change 100 to your desired amount (pesos)
  }
});
