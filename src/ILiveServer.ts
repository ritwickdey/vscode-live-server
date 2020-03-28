import { AddressInfo, Socket } from 'net';
import { ServerResponse, IncomingMessage } from 'http';

export interface WebSocketConnection {
    id: string;
    readyState: number;
    protocol: string;
    url: string;
    version: string;
    remoteAddress: string;
    remoteFamily: string;
    remotePort: number;
    send(data: Buffer | string): void;
    close(code: number, reason: string): void;
}

export interface HttpRequestHandleResult {
    handled: boolean;
    readonly next: Function;
}

export interface ILiveServer {
    maxHeadersCount: number;
    timeout: number;
    keepAliveTimeout: number;
    maxConnections: number;
    WSClients: ReadonlyArray<WebSocketConnection>;
    setTimeout(msecs?: number, callback?: () => void): this;
    setTimeout(callback: () => void): this;
    close(callback?: Function): this;
    address(): AddressInfo | string;
    getConnections(cb: (error: Error | null, count: number) => void): void;

    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;

    addListener(event: 'close', listener: () => void): this;
    addListener(event: 'connection', listener: (socket: Socket) => void): this;
    addListener(event: 'error', listener: (err: Error) => void): this;
    addListener(event: 'ws.client.open', listener: (connection: WebSocketConnection, request: IncomingMessage) => void): this;
    addListener(event: 'ws.client.message', listener: (connection: WebSocketConnection, message: Buffer | string) => void): this;
    addListener(event: 'ws.client.close', listener: (connection: WebSocketConnection, code: number, reason: string) => void): this;
    addListener(event: 'http.fs.request', listener: (request: IncomingMessage, response: ServerResponse, hr: HttpRequestHandleResult) => void): this;

    on(event: 'close', listener: () => void): this;
    on(event: 'connection', listener: (socket: Socket) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'ws.client.open', listener: (connection: WebSocketConnection, request: IncomingMessage) => void): this;
    on(event: 'ws.client.message', listener: (connection: WebSocketConnection, message: Buffer | string) => void): this;
    on(event: 'ws.client.close', listener: (connection: WebSocketConnection, code: number, reason: string) => void): this;
    on(event: 'http.fs.request', listener: (request: IncomingMessage, response: ServerResponse, hr: HttpRequestHandleResult) => void): this;

    once(event: 'close', listener: () => void): this;
    once(event: 'connection', listener: (socket: Socket) => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'ws.client.open', listener: (connection: WebSocketConnection, request: IncomingMessage) => void): this;
    once(event: 'ws.client.message', listener: (connection: WebSocketConnection, message: Buffer | string) => void): this;
    once(event: 'ws.client.close', listener: (connection: WebSocketConnection, code: number, reason: string) => void): this;
    once(event: 'http.fs.request', listener: (request: IncomingMessage, response: ServerResponse, hr: HttpRequestHandleResult) => void): this;
}
