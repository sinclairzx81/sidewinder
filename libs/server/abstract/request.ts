export abstract class ServiceRequest {
    abstract get ipAddress(): string
    abstract get method(): string
    abstract get headers(): Record<string, string>
    abstract get query(): Record<string, string>
    
    abstract json<T extends unknown>(): Promise<T>
    abstract text(): Promise<string>
    abstract buffer(): Promise<Uint8Array>
}