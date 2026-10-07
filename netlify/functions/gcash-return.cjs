// PayMongo sends the customer here after GCash. This page hands them back
// to the Android app through the carepoint:// deep link the app already
// uses for Google sign-in. The app then verifies the payment with PayMongo.
const DEEP_LINK = 'carepoint://auth-callback?gcash=return';

exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Returning to CarePoint…</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#F3ECE0;color:#231915;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:24px}
    .card{max-width:340px}
    h1{font-size:22px;margin:0 0 8px}
    p{color:#4B3B30;margin:0 0 20px}
    a{display:inline-block;background:#B65D36;color:#fff;text-decoration:none;font-weight:600;padding:14px 22px;border-radius:6px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Returning to CarePoint…</h1>
    <p>If the app doesn't open on its own, tap the button below.</p>
    <a href="${DEEP_LINK}">Open CarePoint</a>
  </div>
  <script>setTimeout(function(){ window.location.href = '${DEEP_LINK}'; }, 300);</script>
</body>
</html>`,
});
