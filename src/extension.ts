'use strict';

import { ExtensionContext, workspace, commands, window } from 'vscode';
import { StatusbarUi } from './StatusbarUi';
import { AppModel } from './appModel';
import { checkNewAnnouncement } from './announcement';

const appModel = new AppModel();

export function activate(context: ExtensionContext) {
    checkNewAnnouncement(context.globalState);
    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.goOnline', (fileUri) => {
            workspace.saveAll().then(() => {
                appModel.Golive(fileUri ? fileUri.fsPath : null);
            });
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
    appModel.GoOffline();
}
