#!/usr/bin/env node

// Example usage of the env-config module
import { config, DEFAULT_CONFIG, MIN_VALUES, MAX_VALUES } from './dist/index.js';

console.log('Environment Configuration Example');
console.log('=================================');
console.log();

console.log('Default values:');
console.log(`PING_TIMEOUT_MS default: ${DEFAULT_CONFIG.pingTimeoutMs}ms`);
console.log(`FAST_THRESHOLD_MS default: ${DEFAULT_CONFIG.fastThresholdMs}ms`);
console.log(`SLOW_THRESHOLD_MS default: ${DEFAULT_CONFIG.slowThresholdMs}ms`);
console.log();

console.log('Current configuration (from environment or defaults):');
console.log(`PING_TIMEOUT_MS: ${config.pingTimeoutMs}ms`);
console.log(`FAST_THRESHOLD_MS: ${config.fastThresholdMs}ms`);
console.log(`SLOW_THRESHOLD_MS: ${config.slowThresholdMs}ms`);
console.log();

console.log('Valid ranges:');
console.log(`PING_TIMEOUT_MS: ${MIN_VALUES.pingTimeoutMs} - ${MAX_VALUES.pingTimeoutMs}ms`);
console.log(`FAST_THRESHOLD_MS: ${MIN_VALUES.fastThresholdMs} - ${MAX_VALUES.fastThresholdMs}ms`);
console.log(`SLOW_THRESHOLD_MS: ${MIN_VALUES.slowThresholdMs} - ${MAX_VALUES.slowThresholdMs}ms`);
console.log();

console.log('Environment variables checked:');
console.log(`PING_TIMEOUT_MS=${process.env.PING_TIMEOUT_MS || 'undefined'}`);
console.log(`FAST_THRESHOLD_MS=${process.env.FAST_THRESHOLD_MS || 'undefined'}`);
console.log(`SLOW_THRESHOLD_MS=${process.env.SLOW_THRESHOLD_MS || 'undefined'}`);