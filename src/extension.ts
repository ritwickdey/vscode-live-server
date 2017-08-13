'use strict';

import * as vscode from 'vscode';
import { StatusbarUi } from './StatusbarUi';
import { AppModel } from './appModel'

export function activate(context: vscode.ExtensionContext) {
    const appModel = new AppModel();

    context.subscriptions.push(vscode.commands
        .registerCommand('extension.liveServer.goOnline', () => {
            vscode.workspace.saveAll().then(() => {
                appModel.Golive();
            });
        })
    );

    context.subscriptions.push(vscode.commands
        .registerCommand('extension.liveServer.goOffline', () => {
            appModel.GoOffline();
        })
    );

    context.subscriptions.push(vscode.window
        .onDidChangeActiveTextEditor(() => {
            if (vscode.window.activeTextEditor == undefined) return;
            if (vscode.workspace.rootPath == undefined && vscode.window.activeTextEditor.document.languageId == 'html') {
                StatusbarUi.Init();
            }
        })
    );

    context.subscriptions.push(appModel);
}


export function deactivate() {

}
