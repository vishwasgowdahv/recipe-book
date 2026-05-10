import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // Keep your existing React plugin
    tailwindcss(), // Add the Tailwind CSS plugin here
  ],
});
