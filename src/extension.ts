'use strict';

import {ExtensionContext, workspace, commands, window} from 'vscode';
import { StatusbarUi } from './StatusbarUi';
import { AppModel } from './appModel'

export function activate(context: ExtensionContext) {
    const appModel = new AppModel();

    context.subscriptions.push(commands
        .registerCommand('extension.liveServer.goOnline', () => {
            workspace.saveAll().then(() => {
                appModel.Golive();
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
            if (workspace.rootPath === undefined && window.activeTextEditor.document.languageId === 'html') {
                StatusbarUi.Init();
            }
        })
    );

    context.subscriptions.push(appModel);
}


export function deactivate() {

}
