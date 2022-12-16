export abstract class ServiceResponse {
    abstract writeHead(status: number, headers: Record<string, any>): void
    abstract write(buffer: Uint8Array): Promise<void>
    abstract end(): Promise<void>
}