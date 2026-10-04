// Load Ionic
(async () => {
  const ionicPath = '/ionic.esm.js'
  await import(/* @vite-ignore */ ionicPath)
})()

// GCash Payment Handler
async function payWithGCash(amount) {
  try {
    const response = await fetch('/.netlify/functions/create-gcash-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in PHP
        referenceId: `CAREPOINT-${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (data.success && data.checkoutUrl) {
      // Redirect to GCash authorization page
      window.location.href = data.checkoutUrl;
    } else {
      alert('GCash Payment Error: ' + (data.error || 'Failed to initialize payment'));
    }
  } catch (err) {
    console.error('Payment Error:', err);
  }
}

// Attach event listener to your GCash button ID
document.addEventListener('DOMContentLoaded', () => {
  const gcashBtn = document.getElementById('gcash-pay-button');
  if (gcashBtn) {
    gcashBtn.addEventListener('click', () => payWithGCash(100)); // Change 100 to your desired amount
  }
});
