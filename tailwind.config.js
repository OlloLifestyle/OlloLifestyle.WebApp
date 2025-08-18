/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'oxford-blue': '#002147',
        'peach': '#FBBF24',
        'green': '#22C55E',
      },
      animation: {
        'mesh-1': 'meshGradient1 8s ease-in-out infinite',
        'mesh-2': 'meshGradient2 10s ease-in-out infinite reverse',
        'orb-float-1': 'orbFloat1 15s ease-in-out infinite',
        'orb-float-2': 'orbFloat2 18s ease-in-out infinite reverse',
        'orb-float-3': 'orbFloat3 12s ease-in-out infinite',
        'orb-float-4': 'orbFloat4 20s ease-in-out infinite reverse',
        'grid-move': 'gridMove 20s linear infinite',
        'particle-drift': 'particleDrift 15s linear infinite',
        'text-shimmer': 'textShimmer 3s ease-in-out infinite',
        'logo-float': 'logoFloat 6s ease-in-out infinite',
        'line-expand': 'lineExpand 2s ease-out',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'particle-float': 'particleFloat 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        meshGradient1: {
          '0%, 100%': { transform: 'translateX(-100px) translateY(-100px)' },
          '50%': { transform: 'translateX(100px) translateY(100px)' },
        },
        meshGradient2: {
          '0%, 100%': { transform: 'translateX(100px) translateY(100px)' },
          '50%': { transform: 'translateX(-100px) translateY(-100px)' },
        },
        orbFloat1: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '33%': { transform: 'translateY(-30px) translateX(20px) scale(1.1)' },
          '66%': { transform: 'translateY(20px) translateX(-15px) scale(0.9)' },
        },
        orbFloat2: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '33%': { transform: 'translateY(25px) translateX(-20px) scale(0.95)' },
          '66%': { transform: 'translateY(-20px) translateX(25px) scale(1.05)' },
        },
        orbFloat3: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-40px) translateX(30px) rotate(180deg)' },
        },
        orbFloat4: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(30px) translateX(-40px) rotate(-180deg)' },
        },
        gridMove: {
          '0%': { transform: 'translateX(-60px) translateY(-60px)' },
          '100%': { transform: 'translateX(0px) translateY(0px)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(0px) translateX(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
        },
        textShimmer: {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '-200% center' },
        },
        logoFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.05)' },
        },
        lineExpand: {
          '0%': { width: '0%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { width: '100%', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.4' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}