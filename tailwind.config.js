/**
 * Welding Consumable Calculator (WCC)
 * Tailwind CSS Configuration
 * Aesthetic: Windows 11 Pro Fluent Design System
 * Mobile-First Responsive Architecture
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.js', // Strictly .js file extensions only
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Segoe UI Variable',
          'Segoe UI',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Cascadia Code',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        fluent: {
          // Windows 11 Signature Accent Blue
          accent: {
            DEFAULT: '#0067c0',
            hover: '#005fb8',
            active: '#0054a6',
            light: '#e0eef9',
            dark: '#4cc2ff',
          },
          // Mica and Acrylic Neutral Surfaces
          bg: {
            light: '#f3f3f3',
            dark: '#202020',
          },
          card: {
            light: 'rgba(255, 255, 255, 0.78)',
            dark: 'rgba(40, 40, 40, 0.78)',
          },
          stroke: {
            light: 'rgba(0, 0, 0, 0.08)',
            dark: 'rgba(255, 255, 255, 0.08)',
          },
          subtle: {
            light: '#f9f9f9',
            dark: '#2d2d2d',
          },
        },
      },
      boxShadow: {
        // Fluent Elevation Levels
        'fluent-card': '0px 2px 4px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.06)',
        'fluent-flyout': '0px 8px 16px rgba(0, 0, 0, 0.14)',
        'fluent-modal': '0px 16px 32px rgba(0, 0, 0, 0.24)',
      },
      backdropBlur: {
        acrylic: '20px',
        mica: '30px',
      },
      borderRadius: {
        fluent: '8px',
        'fluent-lg': '12px',
      },
    },
  },
  plugins: [],
};