import { servicesDb, ServiceStatus } from './db/services.js';
const PING_TIMEOUT_MS = parseInt(process.env.PING_TIMEOUT_MS || '5000', 10);
const FAST_THRESHOLD_MS = parseInt(process.env.FAST_THRESHOLD_MS || '1000', 10);
const SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_THRESHOLD_MS || '2000', 10);
const MONITOR_INTERVAL_MS = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 1; // Reduced from 2 to 1 for faster processing
const BATCH_SIZE = 75; // Process 75 services per batch
const BATCH_DELAY_MS = 1000; // 1 second delay between batches
// Enhanced Browser Fingerprinting
const BROWSER_PROFILES = [
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        platform: 'Win32',
        acceptLanguage: 'en-US,en;q=0.9',
        acceptEncoding: 'gzip, deflate, br, zstd',
        secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0'
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        platform: 'MacIntel',
        acceptLanguage: 'en-US,en;q=0.9',
        acceptEncoding: 'gzip, deflate, br, zstd',
        secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        secChUaPlatform: '"macOS"',
        secChUaMobile: '?0'
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        platform: 'Win32',
        acceptLanguage: 'en-US,en;q=0.5',
        acceptEncoding: 'gzip, deflate, br',
        // Firefox doesn't send Sec-CH-UA headers
        secChUa: undefined,
        secChUaPlatform: undefined,
        secChUaMobile: undefined
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
        platform: 'MacIntel',
        acceptLanguage: 'en-US,en;q=0.9',
        acceptEncoding: 'gzip, deflate, br',
        // Safari doesn't send Sec-CH-UA headers
        secChUa: undefined,
        secChUaPlatform: undefined,
        secChUaMobile: undefined
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
        platform: 'Win32',
        acceptLanguage: 'en-US,en;q=0.9',
        acceptEncoding: 'gzip, deflate, br, zstd',
        secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
        secChUaPlatform: '"Windows"',
        secChUaMobile: '?0'
    },
    {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        platform: 'Linux x86_64',
        acceptLanguage: 'en-US,en;q=0.9',
        acceptEncoding: 'gzip, deflate, br, zstd',
        secChUa: '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        secChUaPlatform: '"Linux"',
        secChUaMobile: '?0'
    }
];
const REFERERS = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://search.yahoo.com/',
    undefined // No referer sometimes
];
// Advanced browser fingerprinting
function getRandomBrowserProfile() {
    return BROWSER_PROFILES[Math.floor(Math.random() * BROWSER_PROFILES.length)];
}
function getRandomReferer() {
    return REFERERS[Math.floor(Math.random() * REFERERS.length)];
}
function generateAdvancedHeaders() {
    const profile = getRandomBrowserProfile();
    const referer = getRandomReferer();
    const headers = {
        'User-Agent': profile.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': profile.acceptLanguage,
        'Accept-Encoding': profile.acceptEncoding,
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1'
    };
    // Add Chromium-specific headers
    if (profile.secChUa) {
        headers['sec-ch-ua'] = profile.secChUa;
        headers['sec-ch-ua-mobile'] = profile.secChUaMobile;
        headers['sec-ch-ua-platform'] = profile.secChUaPlatform;
    }
    // Sometimes add referer
    if (referer) {
        headers['Referer'] = referer;
    }
    // Randomly add viewport hints
    if (Math.random() > 0.5) {
        headers['Viewport-Width'] = String(Math.floor(Math.random() * 800) + 1200);
        headers['sec-ch-viewport-width'] = headers['Viewport-Width'];
    }
    return headers;
}
// Legacy function for compatibility
function generateDiversifiedHeaders() {
    return generateAdvancedHeaders();
}
// Service-specific timing patterns to mimic human behavior
const serviceTimings = new Map();
function getHumanlikeDelay(url, isRetry = false) {
    const urlHash = url;
    const now = Date.now();
    const timing = serviceTimings.get(urlHash);
    // Base delay between 2-8 seconds for different services
    if (!timing) {
        const baseDelay = Math.floor(Math.random() * 6000) + 2000; // 2-8 seconds
        serviceTimings.set(urlHash, { lastAccess: now, baseDelay });
        return baseDelay;
    }
    const timeSinceLastAccess = now - timing.lastAccess;
    // If accessed recently, add extra delay to avoid patterns
    let delay = timing.baseDelay;
    if (timeSinceLastAccess < 60000) { // Less than 1 minute
        delay += Math.floor(Math.random() * 5000) + 3000; // Add 3-8 seconds
    }
    // Retry requests should be slower and more varied
    if (isRetry) {
        delay += Math.floor(Math.random() * 10000) + 5000; // Add 5-15 seconds
    }
    // Add natural jitter (human-like variance)
    const jitter = Math.floor(Math.random() * 2000) - 1000; // ±1 second
    delay += jitter;
    timing.lastAccess = now;
    return Math.max(delay, 1000); // Minimum 1 second
}
// Rate limiting with jitter (legacy compatibility)
function getJitteredDelay(baseDelayMs = 0) {
    const jitter = Math.random() * 2000; // 0-2 seconds jitter
    return baseDelayMs + jitter;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Simple session management for persistent connections
const serviceSessions = new Map();
function getSessionCookies(url) {
    const domain = new URL(url).hostname;
    const session = serviceSessions.get(domain);
    // Return existing session if less than 30 minutes old
    if (session && (Date.now() - session.lastUsed) < 1800000) {
        session.lastUsed = Date.now();
        return session.cookies;
    }
    return undefined;
}
function storeSessionCookies(url, cookieHeader) {
    const domain = new URL(url).hostname;
    serviceSessions.set(domain, {
        cookies: cookieHeader,
        lastUsed: Date.now()
    });
}
let monitorInterval = null;
async function performSinglePing(url, headers) {
    const startTime = performance.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
        // Add existing cookies if available
        const existingCookies = getSessionCookies(url);
        if (existingCookies) {
            headers['Cookie'] = existingCookies;
        }
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers,
        });
        clearTimeout(timeoutId);
        const latencyMs = Math.round(performance.now() - startTime);
        // Store cookies from response
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            storeSessionCookies(url, setCookieHeader);
        }
        // Enhanced status classification
        if (response.status === 403 && latencyMs < 1000) {
            // Fast 403 likely indicates bot detection
            return {
                status: ServiceStatus.BLOCKED,
                latencyMs,
                httpCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText} (likely bot detection)`,
            };
        }
        if (response.status === 400) {
            // Bad request - could be bot detection or malformed request
            return {
                status: ServiceStatus.BLOCKED,
                latencyMs,
                httpCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText} (bad request)`,
            };
        }
        if (response.status >= 500) {
            // Server errors - actual service issues
            return {
                status: ServiceStatus.DOWN,
                latencyMs,
                httpCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
        if (response.status >= 400) {
            // Other 4xx errors
            return {
                status: ServiceStatus.DOWN,
                latencyMs,
                httpCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
        // Success - check latency thresholds
        if (latencyMs <= FAST_THRESHOLD_MS) {
            return { status: ServiceStatus.UP, latencyMs, httpCode: response.status };
        }
        else if (latencyMs <= SLOW_THRESHOLD_MS) {
            return { status: ServiceStatus.SLOW, latencyMs, httpCode: response.status };
        }
        else {
            return { status: ServiceStatus.DOWN, latencyMs, httpCode: response.status };
        }
    }
    catch (error) {
        const latencyMs = Math.round(performance.now() - startTime);
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = `Timeout after ${PING_TIMEOUT_MS}ms`;
            }
            else {
                errorMessage = error.message;
            }
        }
        return {
            status: ServiceStatus.DOWN,
            latencyMs: latencyMs > PING_TIMEOUT_MS ? null : latencyMs,
            error: errorMessage,
        };
    }
}
async function pingService(url) {
    // First attempt with advanced headers
    let result = await performSinglePing(url, generateAdvancedHeaders());
    // Enhanced retry logic for bot-blocked services
    if ((result.status === ServiceStatus.BLOCKED ||
        (result.status === ServiceStatus.DOWN && result.httpCode === 403)) &&
        result.latencyMs !== null && result.latencyMs < 2000) {
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            console.log(`[Monitor] Retry attempt ${attempt} for ${url} after ${result.status}`);
            // Wait with humanlike timing before retry
            const retryDelay = getHumanlikeDelay(url, true);
            await sleep(retryDelay);
            // Try with completely different browser profile
            const retryHeaders = generateAdvancedHeaders();
            const retryResult = await performSinglePing(url, retryHeaders);
            // If we get a successful response, use it
            if (retryResult.status === ServiceStatus.UP || retryResult.status === ServiceStatus.SLOW) {
                result = retryResult;
                break;
            }
            // If we get a different type of error, it might be more informative
            if (retryResult.status === ServiceStatus.DOWN && retryResult.httpCode !== 403 && retryResult.httpCode !== 400) {
                result = retryResult;
                break;
            }
        }
    }
    return result;
}
async function processBatch(services, batchIndex) {
    const pingPromises = services.map(async (service, index) => {
        // Add minimal jitter between service checks within batch (reduced for higher throughput)
        if (index > 0) {
            await sleep(getJitteredDelay(50)); // 0.05-0.55 second delay between services
        }
        const result = await pingService(service.url);
        const statusEmoji = {
            [ServiceStatus.UP]: '🟢',
            [ServiceStatus.SLOW]: '🟡',
            [ServiceStatus.DOWN]: '🔴',
            [ServiceStatus.BLOCKED]: '🟠',
        }[result.status];
        if (result.status === ServiceStatus.DOWN || result.status === ServiceStatus.BLOCKED) {
            console.error(`[Monitor] Batch ${batchIndex + 1} - ${statusEmoji} ${service.name} (${service.url}) - ${result.status} - ${result.error || 'Service unavailable'}`);
        }
        else {
            console.log(`[Monitor] Batch ${batchIndex + 1} - ${statusEmoji} ${service.name} (${service.url}) - ${result.status} - ${result.latencyMs}ms`);
        }
        return {
            service,
            result,
        };
    });
    try {
        const results = await Promise.all(pingPromises);
        // Prepare batch updates
        const statusUpdates = results.map(({ service, result }) => ({
            id: service.id,
            status: result.status,
            ...(result.latencyMs !== null && { latencyMs: result.latencyMs }),
        }));
        const checkRecords = results.map(({ service, result }) => ({
            serviceId: service.id,
            status: result.status,
            latencyMs: result.latencyMs,
            httpCode: result.httpCode ?? null,
            errorText: result.error ?? null,
        }));
        // Execute batch database operations
        await Promise.all([
            servicesDb.batchUpdateStatuses(statusUpdates),
            servicesDb.batchRecordChecks(checkRecords),
        ]);
        console.log(`[Monitor] Batch ${batchIndex + 1} completed - updated ${results.length} services`);
    }
    catch (error) {
        console.error(`[Monitor] Batch ${batchIndex + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
}
async function checkAllServices() {
    try {
        const services = await servicesDb.findAll();
        if (services.length === 0) {
            console.log('[Monitor] No services to monitor');
            return;
        }
        console.log(`[Monitor] Checking ${services.length} services in batches of ${BATCH_SIZE}...`);
        // Split services into batches
        const batches = [];
        for (let i = 0; i < services.length; i += BATCH_SIZE) {
            batches.push(services.slice(i, i + BATCH_SIZE));
        }
        console.log(`[Monitor] Processing ${batches.length} batches`);
        // Process batches with delay between them
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`[Monitor] Processing batch ${i + 1}/${batches.length} (${batch.length} services)`);
            await processBatch(batch, i);
            // Add delay between batches (except for the last one)
            if (i < batches.length - 1) {
                console.log(`[Monitor] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
                await sleep(BATCH_DELAY_MS);
            }
        }
        console.log(`[Monitor] Completed checking ${services.length} services across ${batches.length} batches`);
    }
    catch (error) {
        console.error('[Monitor] Error during service monitoring:', error instanceof Error ? error.message : 'Unknown error');
    }
}
export function startMonitoring() {
    if (monitorInterval) {
        console.log('[Monitor] Monitoring already started');
        return;
    }
    console.log(`[Monitor] Starting service monitoring (interval: ${MONITOR_INTERVAL_MS}ms)`);
    console.log(`[Monitor] Thresholds: FAST ≤ ${FAST_THRESHOLD_MS}ms, SLOW ≤ ${SLOW_THRESHOLD_MS}ms, timeout: ${PING_TIMEOUT_MS}ms`);
    // Run initial check
    checkAllServices().catch((error) => {
        console.error('[Monitor] Initial check failed:', error);
    });
    // Set up interval
    monitorInterval = setInterval(() => {
        checkAllServices().catch((error) => {
            console.error('[Monitor] Scheduled check failed:', error);
        });
    }, MONITOR_INTERVAL_MS);
}
export function stopMonitoring() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        console.log('[Monitor] Service monitoring stopped');
    }
}
export function getMonitoringStatus() {
    return {
        running: monitorInterval !== null,
        interval: MONITOR_INTERVAL_MS,
        thresholds: {
            fast: FAST_THRESHOLD_MS,
            slow: SLOW_THRESHOLD_MS,
            timeout: PING_TIMEOUT_MS,
        },
    };
}
//# sourceMappingURL=monitor.js.map