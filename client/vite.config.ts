import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const backend = 'http://127.0.0.1:3000';
export default defineConfig({
    plugins: [react()],
    server: {
        host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': backend }
    },
    preview: {
        host: '127.0.0.1', port: 4173, proxy: { '/api': backend }
    },
    build: { outDir: 'dist', emptyOutDir: true }
});
