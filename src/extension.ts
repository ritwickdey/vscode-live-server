'use strict';

import { ExtensionContext, workspace, commands, Uri } from 'vscode';
import { AppModel } from './appModel';
import { checkNewAnnouncement } from './announcement';


export function activate(context: ExtensionContext) {
    const appModel = new AppModel(context);

    checkNewAnnouncement(context.globalState);
    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.goOnline', async (fileUri) => {
            await workspace.saveAll();
            appModel.Golive(fileUri ? fileUri.fsPath : null);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.goOffline', () => {
            appModel.GoOffline();
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.changeWorkspace', () => {
            appModel.changeWorkspaceRoot();
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.openWSManagerPage', (conn) => {
            appModel.showWSManagerPanel(conn.id);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.websocket.refresh', () => {
            appModel.refreshWebsocketTree();
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.websocket.closeAll', () => {
            appModel.closeWebsocketClient();
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.websocket.close', (conn) => {
            appModel.closeWebsocketClient(conn.id);
        })
    );


    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.openVFSManagerPage', (node) => {
            appModel.showVFSManagerPanel(node);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.vfs.newfile', (parent) => {
            appModel.VFSFileNew(parent);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.vfs.newdir', (parent) => {
            appModel.VFSDirectoryNew(parent);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.vfs.clear', (parent) => {
            appModel.VFSNodeClear(parent);
        })
    );

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.vfs.remove', (node) => {
            appModel.VFSNodeRemove(node);
        })
    );

    // context.subscriptions.push(window
    //     .onDidChangeActiveTextEditor(() => {
    //         if (window.activeTextEditor === undefined) return;
    //         if (workspace.rootPath === undefined && Helper.IsSupportedFile(window.activeTextEditor.document.fileName)) {
    //             StatusbarUi.Init();
    //         }
    //     })
    // );

    context.subscriptions.push(appModel);
}

export function deactivate() {

}
