export declare function startMonitoring(): void;
export declare function stopMonitoring(): void;
export declare function getMonitoringStatus(): {
    running: boolean;
    interval: number;
    thresholds: {
        fast: number;
        slow: number;
        timeout: number;
    };
};
//# sourceMappingURL=monitor.d.ts.map