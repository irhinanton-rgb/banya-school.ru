import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function stripCrossoriginPlugin(): Plugin {
  return {
    name: 'strip-crossorigin',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin(?:="[^"]*")?/gi, '');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), stripCrossoriginPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom/client': 'preact/compat/client',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('preact')) {
              return 'vendor-ui';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('/src/data/levelsPart1')) {
              return 'data-levels-1';
            }
            if (id.includes('/src/data/levelsPart2')) {
              return 'data-levels-2';
            }
            if (id.includes('/src/data/referenceData')) {
              return 'data-ref';
            }
            if (id.includes('/src/components/simulators/')) {
              const name = id.split('/src/components/simulators/')[1]?.split('.')[0]?.toLowerCase() || 'sim';
              return `sim-${name}`;
            }
            if (id.includes('/src/components/HandbookView')) {
              return 'view-handbook';
            }
            if (id.includes('/src/components/FinalExamModal') || id.includes('/src/components/CertificateModal')) {
              return 'view-exam';
            }
            if (id.includes('/src/components/LevelViewer')) {
              return 'view-level';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
