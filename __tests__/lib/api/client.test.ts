import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Mock window.location for redirect assertions
const locationMock = { href: '' };
Object.defineProperty(globalThis, 'window', {
  value: { location: locationMock },
  writable: true,
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import apiClient, { apiFetch, getApiErrorDetail } from '@/lib/api/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mock = new MockAdapter(apiClient);
// Mock for the bare `axios.post` used to call the BFF refresh endpoint
const axiosMock = new MockAdapter(axios);

beforeEach(() => {
  mock.reset();
  axiosMock.reset();
  locationMock.href = '';
});

// ─── apiFetch ─────────────────────────────────────────────────────────────────

describe('apiFetch', () => {
  it('prepends /api/ prefix and returns response data', async () => {
    mock.onGet('/api/techniques/').reply(200, [{ id: 1, name: 'Armbar' }]);
    const result = await apiFetch('techniques/');
    expect(result).toEqual([{ id: 1, name: 'Armbar' }]);
  });

  it('throws on non-2xx status', async () => {
    mock.onGet('/api/techniques/').reply(500);
    await expect(apiFetch('techniques/')).rejects.toThrow();
  });
});

// ─── getApiErrorDetail ────────────────────────────────────────────────────────

describe('getApiErrorDetail', () => {
  it('extracts detail string from AxiosError response', async () => {
    mock.onGet('/api/test/').reply(400, { detail: 'Not found.' });
    try {
      await apiClient.get('/api/test/');
    } catch (err) {
      expect(getApiErrorDetail(err)).toBe('Not found.');
    }
  });

  it('returns undefined for non-Axios errors', () => {
    expect(getApiErrorDetail(new Error('generic'))).toBeUndefined();
  });

  it('returns undefined when response has no detail field', async () => {
    mock.onGet('/api/test/').reply(422, { username: ['Already taken.'] });
    try {
      await apiClient.get('/api/test/');
    } catch (err) {
      expect(getApiErrorDetail(err)).toBeUndefined();
    }
  });
});

// ─── 401 interceptor — token refresh ─────────────────────────────────────────

describe('401 interceptor', () => {
  it('refreshes token and retries request on 401', async () => {
    let callCount = 0;
    mock.onGet('/api/protected/').reply(() => {
      callCount++;
      return callCount === 1 ? [401] : [200, { ok: true }];
    });
    axiosMock.onPost('/api/auth/token/refresh/').reply(200, { ok: true });

    const result = await apiClient.get('/api/protected/');
    expect(result.data).toEqual({ ok: true });
    expect(callCount).toBe(2);
  });

  it('redirects to /login when refresh endpoint returns 401', async () => {
    mock.onGet('/api/protected/').reply(401);
    mock.onPost('/api/auth/token/refresh/').reply(401);
    axiosMock.onPost('/api/auth/token/refresh/').reply(401);

    await expect(apiClient.get('/api/protected/')).rejects.toThrow();
    expect(locationMock.href).toBe('/login');
  });

  it('does not retry the same request twice', async () => {
    let callCount = 0;
    mock.onGet('/api/protected/').reply(() => {
      callCount++;
      return [401];
    });
    axiosMock.onPost('/api/auth/token/refresh/').reply(401);

    await expect(apiClient.get('/api/protected/')).rejects.toThrow();
    expect(callCount).toBe(1);
  });

  it('queues parallel requests during refresh and replays them', async () => {
    let protectedCallCount = 0;
    mock.onGet('/api/protected/').reply(() => {
      protectedCallCount++;
      return protectedCallCount <= 2 ? [401] : [200, { ok: true }];
    });
    axiosMock.onPost('/api/auth/token/refresh/').reply(200, { ok: true });

    const [r1, r2] = await Promise.all([
      apiClient.get('/api/protected/'),
      apiClient.get('/api/protected/'),
    ]);
    expect(r1.data).toEqual({ ok: true });
    expect(r2.data).toEqual({ ok: true });
  });
});
