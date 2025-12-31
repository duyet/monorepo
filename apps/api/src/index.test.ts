/**
 * API Tests
 * Basic tests for API endpoints
 * @module index.test
 */

import { describe, it, expect } from 'bun:test';
import app from './index';

interface ApiInfoResponse {
  name: string;
  version: string;
  status: string;
  endpoints: {
    health: string;
    cardDescription: string;
  };
}

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
}

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);
      const json = (await res.json()) as ApiInfoResponse;
      expect(json.name).toBe('duyet.net API');
      expect(json.status).toBe('healthy');
      expect(json.endpoints).toHaveProperty('cardDescription');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await app.request('/health');
      expect(res.status).toBe(200);
      const json = (await res.json()) as HealthResponse;
      expect(json.status).toBe('ok');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('POST /api/llm/generate', () => {
    it('should return 400 when prompt is missing', async () => {
      const res = await app.request('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toContain('prompt');
    });

    it('should return 400 for invalid prompt', async () => {
      const res = await app.request('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'random text' }),
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for non-string prompt', async () => {
      const res = await app.request('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 123 }),
      });
      expect(res.status).toBe(400);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toContain('prompt');
    });

    it('should accept blog card prompt', async () => {
      const res = await app.request('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'generate description for blog card' }),
      });
      // Will fail without OPENROUTER_API_KEY, but should accept valid prompt format
      expect(res.status).not.toBe(400);
    });

    it('should accept featured posts card prompt', async () => {
      const res = await app.request('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'generate description for featured posts card' }),
      });
      // Will fail without OPENROUTER_API_KEY, but should accept valid prompt format
      expect(res.status).not.toBe(400);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await app.request('/unknown-route');
      expect(res.status).toBe(404);
      const json = (await res.json()) as ErrorResponse;
      expect(json.error).toBe('Not Found');
    });
  });
});
