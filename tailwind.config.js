/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'spin-once': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'neon-pulse': {
          '0%': {
            textShadow: '0 0 4px #00EC96, 0 0 8px #00EC96, 0 0 12px #00EC96',
          },
          '25%': {
            textShadow:
                '0 0 4px #00EC96, 0 0 8px #00EC96, 0 0 16px #00EC96, 0 0 20px #00EC96',
          },
          '50%': {
            textShadow:
                '0 0 2px #00EC96, 0 0 5px #00EC96, 0 0 10px #00EC96, 0 0 15px #00EC96, 0 0 25px #00EC96',
          },
          '75%': {
            textShadow:
                '0 0 4px #00EC96, 0 0 8px #00EC96, 0 0 16px #00EC96, 0 0 20px #00EC96',
          },
          '100%': {
            textShadow: '0 0 4px #00EC96, 0 0 8px #00EC96, 0 0 12px #00EC96',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'neon-glow': 'neon-pulse 2s ease-in-out infinite',
      },
      rotate: {
        360: 'rotate(360deg)',
      },
      textShadow: {
        'neon-green':
            '0 0 4px #00EC96, 0 0 8px #00EC96, 0 0 12px #00EC96, 0 0 16px #00EC96',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwindcss-textshadow')],
};
