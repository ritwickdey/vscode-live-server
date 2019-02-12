'use strict';

import { ExtensionContext, workspace, commands, window } from 'vscode';
import { AppModel } from './appModel';
import { checkNewAnnouncement } from './announcement';

export function activate(context: ExtensionContext) {
    const appModel = new AppModel();

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
