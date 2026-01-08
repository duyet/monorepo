/**
 * API Entry Point
 * Hono-based API for Cloudflare Workers
 * @module index
 */

import { Hono } from 'hono';
import cardDescriptionStreamingRouter from './routes/card-description-streaming.js';

/**
 * Cloudflare Workers bindings interface
 */
export interface Env {
  OPENROUTER_API_KEY?: string;
}

/**
 * Main Hono application
 */
const app = new Hono<{ Bindings: Env }>({
  // Strict trailing slash handling
  strict: true,
});

/**
 * Health check endpoint
 */
app.get('/', (c) => {
  return c.json({
    name: 'duyet.net API',
    version: '0.1.0',
    status: 'healthy',
    endpoints: {
      health: '/',
      cardDescription: '/api/llm/generate',
    },
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Register LLM card description streaming routes
 */
app.route('/api/llm/generate', cardDescriptionStreamingRouter);

/**
 * 404 handler
 */
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

/**
 * Error handler
 */
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

/**
 * Export for Cloudflare Workers
 */
export default app;
