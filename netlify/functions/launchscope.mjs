import { Readable } from 'node:stream';
import { handler } from '../../server.js';

// Reuse the same audit, DNS/socket validation, limits and PDF implementation.
// Static assets are served by Netlify's CDN, without invoking this function.
export default async function launchscope(request, context = {}) {
  const url = new URL(request.url);
  const req = request.body ? Readable.fromWeb(request.body) : Readable.from([]);
  req.url = url.pathname + url.search;
  req.method = request.method;
  req.headers = Object.fromEntries(request.headers);
  // Use trusted platform metadata, never a caller-provided forwarding header.
  req.socket = {remoteAddress: context.ip || 'unknown'};
  let status = 200;
  const headers = new Headers();
  let body = null;
  const res = {
    setHeader(name, value) { headers.set(name, String(value)); },
    writeHead(code, values) {
      status = code;
      for (const [name, value] of Object.entries(values)) headers.set(name, String(value));
    },
    end(value) { body = value; }
  };
  try {
    await handler(req, res);
    return new Response(request.method === 'HEAD' ? null : body, {status, headers});
  } catch {
    return Response.json({error: 'Internal server error'}, {status: 500,
      headers: {'cache-control': 'no-store', 'x-content-type-options': 'nosniff'}});
  }
}

export const config = {
  path: ['/api/*', '/health', '/robots.txt', '/sitemap.xml'],
  rateLimit: {windowLimit: 12, windowSize: 60, aggregateBy: 'ip', action: 'rate_limit'}
};
