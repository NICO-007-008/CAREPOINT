// Load Ionic
(async () => {
  const ionicPath = '/ionic.esm.js'
  await import(/* @vite-ignore */ ionicPath)
})()

document.addEventListener('DOMContentLoaded', () => {
  // Site is live — no payment gateway active
})
