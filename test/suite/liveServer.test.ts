import * as assert from 'assert';
import * as fs from 'fs';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as os from 'os';
import * as path from 'path';

const LiveServer = require('live-server');
const INJECTED_CODE = fs.readFileSync(require.resolve('live-server/injected.html'), 'utf8');

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><text>é</text></svg>';
const FIXTURES: { [file: string]: string } = {
    // nested <svg> elements: </svg> occurs several times
    'nested.svg': `<svg xmlns="http://www.w3.org/2000/svg">${SVG}${SVG}<text>中文</text></svg>`,
    // no </body>, so </svg> is the injection tag, with 3 inline SVGs
    'fragment.html': `<div>${SVG}${SVG}${SVG}</div>`,
    'page.html': `<html><body><p>héllo 中文</p>${SVG}</body></html>`
};

function get(port: number, file: string): Promise<{ contentLength: number, body: Buffer }> {
    return new Promise((resolve, reject) => {
        http.get({ host: '127.0.0.1', port, path: '/' + file, agent: false }, res => {
            const chunks: Buffer[] = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve({
                contentLength: Number(res.headers['content-length']),
                body: Buffer.concat(chunks)
            }));
        }).on('error', reject);
    });
}

suite('Live Server Tests', () => {

    suite('Test for reload script injection', () => {
        let root: string;
        let port: number;

        suiteSetup(done => {
            root = fs.mkdtempSync(path.join(os.tmpdir(), 'live-server-test-'));
            for (const file of Object.keys(FIXTURES)) {
                fs.writeFileSync(path.join(root, file), FIXTURES[file], 'utf8');
            }
            const server = LiveServer.start({ root, host: '127.0.0.1', port: 0, open: false, logLevel: 0, watch: [] });
            server.on('listening', () => {
                port = (server.address() as AddressInfo).port;
                done();
            });
        });

        suiteTeardown(() => {
            LiveServer.shutdown();
            fs.rmSync(root, { recursive: true, force: true });
        });

        for (const file of Object.keys(FIXTURES)) {
            test(`should inject once and send a matching Content-Length. e.g. file=${file}`, async () => {
                const { contentLength, body } = await get(port, file);
                const parts = body.toString('utf8').split(INJECTED_CODE);

                assert.equal(contentLength, body.length);
                assert.equal(parts.length - 1, 1);
                assert.equal(parts.join(''), FIXTURES[file]);
            });
        }
    });
});
