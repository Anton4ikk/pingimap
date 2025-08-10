const DEFAULT_CONFIG = {
    pingTimeoutMs: 5000,
    fastThresholdMs: 1000,
    slowThresholdMs: 2000,
    nodeEnv: 'production',
    adminPassword: 'your-secure-admin-password-here',
    jwtSecret: 'your-super-secret-jwt-key-minimum-32-characters',
};
const MIN_VALUES = {
    pingTimeoutMs: 100,
    fastThresholdMs: 1,
    slowThresholdMs: 1,
};
const MAX_VALUES = {
    pingTimeoutMs: 60000,
    fastThresholdMs: 30000,
    slowThresholdMs: 60000,
};
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function parseEnvNumber(envValue, defaultValue) {
    if (!envValue) {
        return defaultValue;
    }
    const parsed = parseInt(envValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function createConfig() {
    const pingTimeoutMs = clamp(parseEnvNumber(process.env.PING_TIMEOUT_MS, DEFAULT_CONFIG.pingTimeoutMs), MIN_VALUES.pingTimeoutMs, MAX_VALUES.pingTimeoutMs);
    const fastThresholdMs = clamp(parseEnvNumber(process.env.FAST_THRESHOLD_MS, DEFAULT_CONFIG.fastThresholdMs), MIN_VALUES.fastThresholdMs, MAX_VALUES.fastThresholdMs);
    const slowThresholdMs = clamp(parseEnvNumber(process.env.SLOW_THRESHOLD_MS, DEFAULT_CONFIG.slowThresholdMs), MIN_VALUES.slowThresholdMs, MAX_VALUES.slowThresholdMs);
    // Parse environment and authentication
    const nodeEnv = process.env.NODE_ENV || DEFAULT_CONFIG.nodeEnv;
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_CONFIG.adminPassword;
    const jwtSecret = process.env.JWT_SECRET || DEFAULT_CONFIG.jwtSecret;
    // Ensure fast threshold is less than slow threshold
    const adjustedFastThresholdMs = Math.min(fastThresholdMs, slowThresholdMs - 1);
    return {
        pingTimeoutMs,
        fastThresholdMs: adjustedFastThresholdMs,
        slowThresholdMs,
        nodeEnv,
        adminPassword,
        jwtSecret,
    };
}
export const config = createConfig();
export { DEFAULT_CONFIG, MIN_VALUES, MAX_VALUES };
//# sourceMappingURL=index.js.map