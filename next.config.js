/** @type {import("next").NextConfig} */
const nextI18nextConfig = require('./next-i18next.config');

// Baseline security response headers applied to every route. Deliberately NO
// Content-Security-Policy yet: the app loads TinyMCE, Stripe, ApexCharts, DO Spaces
// images and Next inline runtime, so a real CSP needs browser verification first
// (add as Report-Only, tune, then enforce). camera=(self) is REQUIRED — the QR
// scanner (html5-qrcode) uses getUserMedia.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
];

const nextConfig = {
  // Emit a self-contained server (.next/standalone) so the production image
  // runs `node server.js` with only the traced dependencies — no `yarn install`
  // in the runner stage, far smaller image, faster cold start.
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
//   i18n: {
//     defaultLocale: nextI18nextConfig.i18n.defaultLocale,
//     locales: nextI18nextConfig.i18n.locales,
//   }
};

module.exports = nextConfig;
