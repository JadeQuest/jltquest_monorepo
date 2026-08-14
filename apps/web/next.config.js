/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable modern image formats
    images: {
        formats: ['image/avif', 'image/webp'],
    },

    // Recommended for modern apps
    reactStrictMode: true,

    // Allow Cloudflare tunnel hostnames to reach the Next.js dev server
    // Fixes: "malformed HTTP response Unauthorized" on HMR WebSocket connections
    allowedDevOrigins: ['*.trycloudflare.com'],

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
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: blob: https:",
                            "font-src 'self' data:",
                            "connect-src 'self' http: https: ws: wss:",
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