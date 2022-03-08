'use strict';

import { ExtensionContext, workspace, commands, window } from 'vscode';
import { AppModel } from './appModel';
import { checkNewAnnouncement, SETUP_STRING } from './announcement';

export function activate(context: ExtensionContext) {
   const appModel = new AppModel();

    Promise.resolve().then(() => {
        context.globalState.setKeysForSync([SETUP_STRING]);
        checkNewAnnouncement(context.globalState);
    });


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

    context.subscriptions.push(appModel);
}


export function deactivate() {

}
