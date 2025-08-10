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
export declare function httpPing(url: string, options?: HttpPingOptions): Promise<HttpPingResult>;
//# sourceMappingURL=httpPing.d.ts.map