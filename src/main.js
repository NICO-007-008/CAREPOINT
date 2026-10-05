// Load Ionic
(async () => {
  const ionicPath = '/ionic.esm.js'
  await import(/* @vite-ignore */ ionicPath)
})()

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('gcash-pay-button');
  if (btn) {
    btn.addEventListener('click', () => {
      alert('Checkout — coming soon');
    });
  }
});
