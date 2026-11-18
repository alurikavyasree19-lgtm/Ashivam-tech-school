import { createApp } from '../app';

let cachedApp: ReturnType<typeof createApp> | null = null;

export default function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = createApp();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error('Vercel API initialization/request error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: err?.message || 'Server initialization failed on Vercel'
        })
      );
    }
  }
}
