import { Router } from 'express';

export const proxyRouter = Router();

// Rate Limiting Map
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const LIMIT = 60;
const WINDOW_MS = 60000;

proxyRouter.post('/', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  let rateInfo = rateLimitMap.get(ip);
  if (!rateInfo || now > rateInfo.resetAt) {
    rateInfo = { count: 0, resetAt: now + WINDOW_MS };
  }
  rateInfo.count++;
  rateLimitMap.set(ip, rateInfo);
  if (rateInfo.count > LIMIT) {
    return res.status(429).json({ error: 'Too many requests', retryAfter: rateInfo.resetAt - now });
  }

  const { url, method = 'GET', headers = {}, body } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // curl reconstruct
  let curlCommand = `curl --request ${method} \\\n  --url ${url}`;
  Object.keys(headers).forEach(k => {
    curlCommand += ` \\\n  --header '${k}: ${headers[k]}'`;
  });
  if (body) {
    const dataStr = typeof body === 'object' ? JSON.stringify(body) : body;
    curlCommand += ` \\\n  --data '${dataStr}'`;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30s timeout

  const requestTimestamp = new Date().toISOString();

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: abortController.signal
    };
    if (method !== 'GET' && method !== 'HEAD' && body) {
      fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    const start = Date.now();
    const response = await fetch(url, fetchOptions);
    const latency = Date.now() - start;
    clearTimeout(timeoutId);

    const responseBody = await response.text();
    let parsedBody = responseBody;
    try { parsedBody = JSON.parse(responseBody); } catch (e) {}

    res.json({
      status: response.status,
      latency,
      curlCommand,
      requestTimestamp,
      data: parsedBody
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      res.json({ status: 408, requestTimestamp, curlCommand, error: 'Request timeout' });
    } else {
      res.json({ status: 500, requestTimestamp, curlCommand, error: error.message });
    }
  }
});

proxyRouter.post('/validate', async (req, res) => {
  const { url, headers = {} } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const start = Date.now();
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);
    const response = await fetch(url, { method: 'OPTIONS', headers, signal: abortController.signal });
    clearTimeout(timeoutId);
    
    // Check CORS
    const corsAllowed = response.headers.has('access-control-allow-origin');
    
    res.json({
      reachable: true,
      corsAllowed,
      latency: Date.now() - start
    });
  } catch (err) {
    res.json({ reachable: false, corsAllowed: false, latency: 0 });
  }
});
