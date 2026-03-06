/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#ede9fe',
                    100: '#ddd6fe',
                    200: '#c4b5fd',
                    300: '#a78bfa',
                    400: '#8b5cf6',
                    500: '#7c3aed',
                    600: '#6d28d9',
                    700: '#5b21b6',
                    800: '#4c1d95',
                    900: '#2e1065',
                },
                amber: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                surface: {
                    900: '#0a0f1e',
                    800: '#0f1629',
                    700: '#161e38',
                    600: '#1e2847',
                    500: '#263057',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};
