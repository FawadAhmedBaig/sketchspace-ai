import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Uncomment to proxy API calls to the backend during development:
  // server: { proxy: { '/api': 'http://localhost:8000' } },
});
