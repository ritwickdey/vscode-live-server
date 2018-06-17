//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', () => {

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ritwickdey.LiveServer'));
    });

    test('should activate', function () {
        this.timeout(1 * 60 * 1000);
        return vscode.extensions.getExtension('ritwickdey.LiveServer').activate()
            .then((api) => {
                assert.ok(true);
            });
    });

    test('should register all live server commands', function () {
        return vscode.commands.getCommands(true).then((commands) => {
            const COMMANDS = [
                'extension.liveServer.goOnline',
                'extension.liveServer.goOffline',
                'extension.liveServer.changeWorkspace'
            ];
            const foundLiveServerCommands = commands.filter((value) => {
                return COMMANDS.indexOf(value) >= 0 || value.startsWith('extension.liveServer.');
            });
            assert.equal(foundLiveServerCommands.length, COMMANDS.length);
        });
    });


});
