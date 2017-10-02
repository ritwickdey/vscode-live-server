'use strict';

import {ExtensionContext, workspace, commands, window} from 'vscode';
import { StatusbarUi } from './StatusbarUi';
import { AppModel } from './appModel';
import { Helper } from './Helper';

export function activate(context: ExtensionContext) {
    const appModel = new AppModel();

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

    context.subscriptions.push(window
        .onDidChangeActiveTextEditor(() => {
            if (window.activeTextEditor === undefined) return;
            if (workspace.rootPath === undefined && Helper.IsSupportedFile(window.activeTextEditor.document.fileName)) {
                StatusbarUi.Init();
            }
        })
    );

    context.subscriptions.push(appModel);
}


export function deactivate() {

}
