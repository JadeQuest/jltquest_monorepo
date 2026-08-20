/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable modern image formats
    images: {
        formats: ['image/avif', 'image/webp'],
    },

    // Recommended for modern apps
    reactStrictMode: true,

    // Allow Cloudflare tunnels, local IP addresses (192.168.x.x, 10.x.x.x), and localhost
    // Fixes: 403 Forbidden on JS chunks and HMR WebSocket connection failure on LAN devices
    allowedDevOrigins: [
        '*.trycloudflare.com',
        '192.168.1.10',
        '192.168.1.10:3000',
        '192.168.*.*',
        '192.168.*.*:3000',
        '10.*.*.*',
        '10.*.*.*:3000',
        '172.*.*.*',
        '172.*.*.*:3000',
        'localhost',
        'localhost:3000',
        '127.0.0.1',
        '127.0.0.1:3000',
    ],

    // Turbopack options
    experimental: {},

    // Standard Web Security Headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.coinbase.com https://cca-lite.coinbase.com https://*.walletconnect.com https://*.walletconnect.org",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: blob: https: https://*.coinbase.com https://*.walletconnect.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "connect-src 'self' http: https: ws: wss: http://192.168.*.*:* http://localhost:* ws://192.168.*.*:* ws://localhost:* https://*.coinbase.com https://cca-lite.coinbase.com https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org wss://*.walletconnect.com",
                            "frame-ancestors 'none'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

let config = nextConfig;
if (process.env.ANALYZE === 'true') {
    try {
        const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
        config = withBundleAnalyzer(nextConfig);
    } catch (e) {
        console.warn('ANALYZE env set but @next/bundle-analyzer is not installed.');
    }
}

module.exports = config;