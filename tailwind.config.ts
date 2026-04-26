import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        // Editorial neutral foundation
        ink: {
          50: '#fafaf9',
          100: '#f5f4f1',
          200: '#e8e6e0',
          300: '#d4d1c9',
          400: '#a8a399',
          500: '#7a7568',
          600: '#5a564a',
          700: '#3d3a32',
          800: '#26241f',
          900: '#181612',
        },
        // Saffron / terracotta accent — Mediterranean/functional medicine nod
        saffron: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd6a5',
          300: '#f8b76d',
          400: '#f49441',
          500: '#e87422',
          600: '#d95818',
          700: '#b54016',
          800: '#923319',
          900: '#762c18',
        },
        // EBM tier signaling
        tier: {
          t1: '#2d6a4f',  // deep green — solid evidence
          t2: '#bc6c25',  // warm ochre — moderate
          t3: '#a4161a',  // muted crimson — low/mechanistic
        },
      },
      letterSpacing: {
        'editorial': '-0.02em',
        'mono-tight': '-0.01em',
      },
    },
  },
  plugins: [],
};

export default config;
