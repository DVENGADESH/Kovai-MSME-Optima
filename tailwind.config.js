/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                industrial: {
                    950: '#0a0c10', // Deepest background
                    900: '#111418', // Main app background
                    800: '#1a1d24', // Card background
                    700: '#252a33', // Borders/Input
                    600: '#343b47',
                    500: '#4b5563',
                    400: '#9ca3af', // Muted text
                    100: '#f3f4f6', // Primary text
                },
                brand: {
                    orange: '#f97316', // Warning/Action (Orange-500)
                    green: '#22c55e', // Success/Safe (Green-500)
                    blue: '#3b82f6', // Info (Blue-500)
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
