import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH controls the deployed sub-path:
//  - GitHub Pages: set to '/<repo-name>/' (the default below)
//  - Docker/Render/root domain hosting: set BASE_PATH='/' before building
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/shopwave/',
});
