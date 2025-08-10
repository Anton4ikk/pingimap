interface Config {
    pingTimeoutMs: number;
    fastThresholdMs: number;
    slowThresholdMs: number;
    nodeEnv: string;
    adminPassword: string;
    jwtSecret: string;
}
declare const DEFAULT_CONFIG: Config;
declare const MIN_VALUES: {
    pingTimeoutMs: number;
    fastThresholdMs: number;
    slowThresholdMs: number;
};
declare const MAX_VALUES: {
    pingTimeoutMs: number;
    fastThresholdMs: number;
    slowThresholdMs: number;
};
export declare const config: Config;
export type { Config };
export { DEFAULT_CONFIG, MIN_VALUES, MAX_VALUES };
//# sourceMappingURL=index.d.ts.map