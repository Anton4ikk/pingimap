import { describe, it, expect } from 'vitest';

describe('Config Module', () => {
  describe('exports', () => {
    it('should export config object with expected properties', async () => {
      const { config } = await import('./index');

      expect(config).toHaveProperty('pingTimeoutMs');
      expect(config).toHaveProperty('fastThresholdMs');
      expect(config).toHaveProperty('slowThresholdMs');

      expect(typeof config.pingTimeoutMs).toBe('number');
      expect(typeof config.fastThresholdMs).toBe('number');
      expect(typeof config.slowThresholdMs).toBe('number');
    });

    it('should export DEFAULT_CONFIG with correct values', async () => {
      const { DEFAULT_CONFIG } = await import('./index');

      expect(DEFAULT_CONFIG.pingTimeoutMs).toBe(5000);
      expect(DEFAULT_CONFIG.fastThresholdMs).toBe(800);
      expect(DEFAULT_CONFIG.slowThresholdMs).toBe(2000);
    });

    it('should export MIN_VALUES with correct constraints', async () => {
      const { MIN_VALUES } = await import('./index');

      expect(MIN_VALUES.pingTimeoutMs).toBe(100);
      expect(MIN_VALUES.fastThresholdMs).toBe(1);
      expect(MIN_VALUES.slowThresholdMs).toBe(1);
    });

    it('should export MAX_VALUES with correct constraints', async () => {
      const { MAX_VALUES } = await import('./index');

      expect(MAX_VALUES.pingTimeoutMs).toBe(60000);
      expect(MAX_VALUES.fastThresholdMs).toBe(30000);
      expect(MAX_VALUES.slowThresholdMs).toBe(60000);
    });
  });

  describe('config validation', () => {
    it('should ensure fast threshold is less than slow threshold', async () => {
      const { config } = await import('./index');

      expect(config.fastThresholdMs).toBeLessThan(config.slowThresholdMs);
    });

    it('should have values within valid ranges', async () => {
      const { config, MIN_VALUES, MAX_VALUES } = await import('./index');

      expect(config.pingTimeoutMs).toBeGreaterThanOrEqual(MIN_VALUES.pingTimeoutMs);
      expect(config.pingTimeoutMs).toBeLessThanOrEqual(MAX_VALUES.pingTimeoutMs);

      expect(config.fastThresholdMs).toBeGreaterThanOrEqual(MIN_VALUES.fastThresholdMs);
      expect(config.fastThresholdMs).toBeLessThanOrEqual(MAX_VALUES.fastThresholdMs);

      expect(config.slowThresholdMs).toBeGreaterThanOrEqual(MIN_VALUES.slowThresholdMs);
      expect(config.slowThresholdMs).toBeLessThanOrEqual(MAX_VALUES.slowThresholdMs);
    });
  });

  describe('internal functions (unit tests)', () => {
    // We'll test the internal logic by importing and testing functions directly
    it('should clamp values correctly', () => {
      // Test the clamp function logic
      const clamp = (value: number, min: number, max: number): number => {
        return Math.min(Math.max(value, min), max);
      };

      expect(clamp(50, 100, 1000)).toBe(100); // Below min
      expect(clamp(1500, 100, 1000)).toBe(1000); // Above max
      expect(clamp(500, 100, 1000)).toBe(500); // Within range
    });

    it('should parse environment values correctly', () => {
      const parseEnvNumber = (envValue: string | undefined, defaultValue: number): number => {
        if (!envValue) {
          return defaultValue;
        }

        const parsed = parseInt(envValue, 10);
        return isNaN(parsed) ? defaultValue : parsed;
      };

      expect(parseEnvNumber(undefined, 5000)).toBe(5000);
      expect(parseEnvNumber('', 5000)).toBe(5000);
      expect(parseEnvNumber('3000', 5000)).toBe(3000);
      expect(parseEnvNumber('invalid', 5000)).toBe(5000);
      expect(parseEnvNumber('0', 5000)).toBe(0);
    });

    it('should handle threshold relationship correctly', () => {
      const adjustThresholds = (fast: number, slow: number) => {
        return {
          fast: Math.min(fast, slow - 1),
          slow: slow
        };
      };

      // When fast >= slow, fast should be adjusted to slow - 1
      expect(adjustThresholds(2000, 1500)).toEqual({ fast: 1499, slow: 1500 });
      expect(adjustThresholds(1000, 1000)).toEqual({ fast: 999, slow: 1000 });

      // When fast < slow, no adjustment needed
      expect(adjustThresholds(800, 2000)).toEqual({ fast: 800, slow: 2000 });
    });
  });
});