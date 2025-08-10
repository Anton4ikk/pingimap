export interface HttpPingResult {
  ok: boolean;
  statusCode?: number;
  latencyMs: number;
  error?: string;
}

export interface HttpPingOptions {
  timeout?: number;
  method?: 'HEAD' | 'GET';
  maxRedirects?: number;
}

export async function httpPing(
  url: string,
  options: HttpPingOptions = {}
): Promise<HttpPingResult> {
  const {
    timeout = 5000,
    method = 'HEAD',
    maxRedirects = 5
  } = options;

  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'pingimap/1.0.0'
      }
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return {
      ok: response.ok,
      statusCode: response.status,
      latencyMs
    };

  } catch (error) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Network error or invalid URL';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      ok: false,
      latencyMs,
      error: errorMessage
    };
  }
}