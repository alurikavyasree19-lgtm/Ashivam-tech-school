import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { ensureDbReady } from './database.js';

export { createApp };

const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : process.cwd();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await ensureDbReady();
  const app = createApp();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true } });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

if (!process.env.VERCEL) {
  startServer();
}
