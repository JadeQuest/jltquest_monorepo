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