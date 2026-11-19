import { createApp } from '../app';

let cachedApp: ReturnType<typeof createApp> | null = null;

function normalizeVercelRequestUrl(req: any) {
  if (!req || typeof req.url !== 'string') return;
  try {
    const parsed = new URL(req.url, 'http://localhost');
    const rewrittenPath = parsed.searchParams.get('__vercel_path');
    if (rewrittenPath !== null) {
      parsed.searchParams.delete('__vercel_path');
      const cleanSubPath = rewrittenPath.replace(/^\/+/, '');
      const cleanQuery = parsed.searchParams.toString();
      if (parsed.pathname === '/api' || parsed.pathname === '/api/index.ts' || parsed.pathname === '/api/') {
        req.url = `/api${cleanSubPath ? `/${cleanSubPath}` : ''}${cleanQuery ? `?${cleanQuery}` : ''}`;
      } else {
        req.url = `${parsed.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
      }
    }
  } catch {
    // Keep original req.url if parsing fails
  }
}

export default function handler(req: any, res: any) {
  try {
    normalizeVercelRequestUrl(req);
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
