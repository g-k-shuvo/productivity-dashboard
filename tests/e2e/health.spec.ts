import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('API health endpoint returns OK', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});

test.describe('Public API Endpoints', () => {
  test('quotes endpoint returns daily quote', async ({ request }) => {
    const response = await request.get('/api/v1/quotes/daily');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.text).toBeDefined();
  });

  test('random quote endpoint works', async ({ request }) => {
    const response = await request.get('/api/v1/quotes/random');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.text).toBeDefined();
  });
});
