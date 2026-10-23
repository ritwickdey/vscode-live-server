import * as assert from 'assert';
import * as fs from 'fs';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import { Config } from '../../src/Config';
import { Helper } from '../../src/Helper';

const liveServer = require('live-server');
const WebSocketClient = require('faye-websocket').Client;

suite('Watch paths', function () {
    this.timeout(10000);

    let fixture: string;
    let workspace: string;
    let mounted: string;
    let server: http.Server;
    let client: any;
    let watchPathsDescriptor: PropertyDescriptor;

    setup(() => {
        watchPathsDescriptor = Object.getOwnPropertyDescriptor(Config, 'getWatchPaths');
        fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'live-server-watch-'));
        workspace = path.join(fixture, 'workspace');
        mounted = path.join(fixture, 'mounted');
        fs.mkdirSync(path.join(workspace, 'web'), { recursive: true });
        fs.mkdirSync(path.join(workspace, 'generated'));
        fs.mkdirSync(mounted);
        fs.writeFileSync(path.join(workspace, 'web', 'index.html'), '<html><body>preview</body></html>');
        fs.writeFileSync(path.join(workspace, 'web', 'ignored.txt'), 'ignored');
        fs.writeFileSync(path.join(workspace, 'generated', 'data.txt'), 'generated data');
        fs.writeFileSync(path.join(mounted, 'data.txt'), 'mounted data');
    });

    teardown(async () => {
        Object.defineProperty(Config, 'getWatchPaths', watchPathsDescriptor);
        if (client) {
            await new Promise<void>(resolve => {
                client.once('close', () => resolve());
                client.close();
            });
            client = undefined;
        }
        if (server) {
            if (liveServer.watcher) {
                await liveServer.watcher.close();
            }
            await new Promise<void>(resolve => server.close(() => resolve()));
            server = undefined;
        }
        fs.rmSync(fixture, { recursive: true });
    });

    function setWatchPaths(value: string[] | null | undefined) {
        Object.defineProperty(Config, 'getWatchPaths', { configurable: true, get: () => value });
    }

    function isWatched(file: string): boolean {
        const entries = liveServer.watcher.getWatched()[path.dirname(file)] || [];
        return entries.includes(path.basename(file));
    }

    async function start(paths: string[] | null) {
        setWatchPaths(paths);
        const params = Helper.generateParams(workspace, workspace);
        server = liveServer.start({
            ...params,
            port: 0,
            host: '127.0.0.1',
            logLevel: 0,
            mount: [['/mounted', mounted]],
            ignore: [path.join(workspace, 'web', 'ignored.txt')]
        });
        // Chokidar does not emit ready when given an empty path list.
        const ready = paths === null || paths.length > 0
            ? new Promise<void>((resolve, reject) => {
                liveServer.watcher.once('ready', () => resolve());
                liveServer.watcher.once('error', reject);
            })
            : Promise.resolve();
        await new Promise<void>((resolve, reject) => {
            server.once('listening', () => resolve());
            server.once('error', reject);
        });
        await ready;
    }

    function serverUrl(): string {
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected a TCP address');
        return `http://127.0.0.1:${address.port}`;
    }

    function get(urlPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            http.get(serverUrl() + urlPath, response => {
                let body = '';
                response.setEncoding('utf8');
                response.on('data', chunk => body += chunk);
                response.on('error', reject);
                response.on('end', () => {
                    if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`));
                    resolve(body);
                });
            }).on('error', reject);
        });
    }

    function nextMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Live reload message timed out')), 5000);
            client.once('message', event => {
                clearTimeout(timeout);
                resolve(event.data);
            });
        });
    }

    test('keeps automatic root and mount watching when unset or null', () => {
        for (const value of [undefined, null]) {
            setWatchPaths(value);
            assert.strictEqual(Helper.generateParams(workspace, workspace).watch, undefined);
        }
    });

    test('resolves literal paths from the selected workspace, independently of the server root', () => {
        setWatchPaths(['web', 'web/index.html', mounted]);
        const root = path.join(workspace, 'web');
        const params = Helper.generateParams(root, workspace);
        assert.deepStrictEqual(params.watch, [root, path.join(root, 'index.html'), mounted]);
        assert.strictEqual(params.root, root);
    });

    test('preserves an empty array for manual refresh mode', () => {
        setWatchPaths([]);
        assert.deepStrictEqual(Helper.generateParams(workspace, workspace).watch, []);
    });

    test('watches the root and mounts by default', async () => {
        await start(null);
        assert.ok(isWatched(path.join(workspace, 'web', 'index.html')));
        assert.ok(isWatched(path.join(workspace, 'generated', 'data.txt')));
        assert.ok(isWatched(path.join(mounted, 'data.txt')));
    });

    test('limits reloads to selected paths while still serving unwatched files and mounts', async () => {
        await start(['web']);
        assert.ok(isWatched(path.join(workspace, 'web', 'index.html')));
        assert.ok(!isWatched(path.join(workspace, 'web', 'ignored.txt')));
        assert.ok(!isWatched(path.join(workspace, 'generated', 'data.txt')));
        assert.ok(!isWatched(path.join(mounted, 'data.txt')));
        assert.strictEqual(await get('/generated/data.txt'), 'generated data');
        assert.strictEqual(await get('/mounted/data.txt'), 'mounted data');

        client = new WebSocketClient(serverUrl().replace('http:', 'ws:') + '/web/index.html/ws');
        assert.strictEqual(await nextMessage(), 'connected');
        const reloaded = nextMessage();
        fs.appendFileSync(path.join(workspace, 'web', 'index.html'), '\n');
        assert.strictEqual(await reloaded, 'reload');
    });

    test('serves files and mounts without creating watchers in manual refresh mode', async () => {
        await start([]);
        assert.ok((await get('/web/index.html')).includes('preview'));
        assert.strictEqual(await get('/generated/data.txt'), 'generated data');
        assert.strictEqual(await get('/mounted/data.txt'), 'mounted data');
        assert.deepStrictEqual(liveServer.watcher.getWatched(), {});
    });
});
