/**
 * Welding Consumable Calculator (WCC)
 * Vite Configuration File (Standalone Static SPA)
 * Enforces pure .js file extensions for all React components
 * Static-Host Ready: Relative base path ('./') for GitHub Pages, Vercel & Netlify
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react({
      // Treat all .js files as React components
      include: '**/*.js',
    }),
  ],
  esbuild: {
    // Enable JSX loader for .js files inside src directory
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});