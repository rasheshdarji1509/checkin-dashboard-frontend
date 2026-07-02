import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild', // fast, excellent minification
    chunkSizeWarningLimit: 600,
    cssMinify: true,
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate long-lived cacheable chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'vendor-recharts'; // chart lib — only needed on dashboard
            }
            if (id.includes('@mui/icons-material')) {
              return 'vendor-mui-icons'; // icons are large, separate chunk
            }
            if (id.includes('@mui/material') || id.includes('@emotion')) {
              return 'vendor-mui'; // MUI core
            }
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('immer')) {
              return 'vendor-redux';
            }
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-misc'; // everything else in node_modules
          }
        },
        // Consistent hashing for better long-term caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  // Optimize dependencies pre-bundling in dev mode
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@reduxjs/toolkit',
      'react-redux',
      'recharts',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
