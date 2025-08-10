import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpPing } from './httpPing.js';

// Mock performance.now to control timing
const mockPerformanceNow = vi.fn();
vi.stubGlobal('performance', { now: mockPerformanceNow });

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock setTimeout and clearTimeout
const mockSetTimeout = vi.fn();
const mockClearTimeout = vi.fn();
vi.stubGlobal('setTimeout', mockSetTimeout);
vi.stubGlobal('clearTimeout', mockClearTimeout);

describe('httpPing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return successful result for 200 response', async () => {
    // Setup timing mock
    mockPerformanceNow
      .mockReturnValueOnce(0) // start time
      .mockReturnValueOnce(100); // end time

    // Setup timeout mock
    const mockTimeoutId = 123;
    mockSetTimeout.mockReturnValue(mockTimeoutId);

    // Setup fetch mock
    const mockResponse = {
      ok: true,
      status: 200
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await httpPing('https://example.com');

    expect(result).toEqual({
      ok: true,
      statusCode: 200,
      latencyMs: 100
    });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
      method: 'HEAD',
      signal: expect.any(AbortSignal),
      redirect: 'follow',
      headers: {
        'User-Agent': 'pingimap/1.0.0'
      }
    });

    expect(mockClearTimeout).toHaveBeenCalledWith(mockTimeoutId);
  });

  it('should return failure result for 404 response', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(150);

    const mockTimeoutId = 456;
    mockSetTimeout.mockReturnValue(mockTimeoutId);

    const mockResponse = {
      ok: false,
      status: 404
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await httpPing('https://example.com/notfound');

    expect(result).toEqual({
      ok: false,
      statusCode: 404,
      latencyMs: 150
    });
  });

  it('should use GET method when specified', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(200);

    mockSetTimeout.mockReturnValue(789);

    const mockResponse = {
      ok: true,
      status: 200
    };
    mockFetch.mockResolvedValue(mockResponse);

    await httpPing('https://example.com', { method: 'GET' });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com',
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  it('should handle timeout error', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(5000);

    // Mock AbortController
    const mockAbort = vi.fn();
    const mockController = { abort: mockAbort };
    const mockAbortSignal = {};
    vi.stubGlobal('AbortController', vi.fn(() => ({
      ...mockController,
      signal: mockAbortSignal
    })));

    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'AbortError';
    mockFetch.mockRejectedValue(timeoutError);

    const result = await httpPing('https://slow-example.com', { timeout: 1000 });

    expect(result).toEqual({
      ok: false,
      latencyMs: 5000,
      error: 'Request timeout'
    });
  });

  it('should handle network error', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(50);

    mockSetTimeout.mockReturnValue(999);

    const networkError = new Error('Failed to fetch');
    networkError.name = 'TypeError';
    mockFetch.mockRejectedValue(networkError);

    const result = await httpPing('https://invalid-domain.test');

    expect(result).toEqual({
      ok: false,
      latencyMs: 50,
      error: 'Network error or invalid URL'
    });
  });

  it('should handle unknown error', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(25);

    mockSetTimeout.mockReturnValue(111);

    const unknownError = new Error('Some other error');
    unknownError.name = 'SomeOtherError';
    mockFetch.mockRejectedValue(unknownError);

    const result = await httpPing('https://example.com');

    expect(result).toEqual({
      ok: false,
      latencyMs: 25,
      error: 'Some other error'
    });
  });

  it('should handle non-Error exception', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(75);

    mockSetTimeout.mockReturnValue(222);

    mockFetch.mockRejectedValue('String error');

    const result = await httpPing('https://example.com');

    expect(result).toEqual({
      ok: false,
      latencyMs: 75,
      error: 'Unknown error'
    });
  });

  it('should use custom timeout', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(300);

    const mockTimeoutId = 333;
    mockSetTimeout.mockReturnValue(mockTimeoutId);

    const mockResponse = {
      ok: true,
      status: 200
    };
    mockFetch.mockResolvedValue(mockResponse);

    await httpPing('https://example.com', { timeout: 10000 });

    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
  });

  it('should round latency to nearest millisecond', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(123.7); // Should round to 124

    mockSetTimeout.mockReturnValue(444);

    const mockResponse = {
      ok: true,
      status: 200
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await httpPing('https://example.com');

    expect(result.latencyMs).toBe(124);
  });

  it('should handle successful response with different status codes', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(80);

    mockSetTimeout.mockReturnValue(555);

    const mockResponse = {
      ok: true,
      status: 201
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await httpPing('https://example.com');

    expect(result).toEqual({
      ok: true,
      statusCode: 201,
      latencyMs: 80
    });
  });
});