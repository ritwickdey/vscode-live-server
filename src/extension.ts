'use strict';

import * as vscode from 'vscode';
import {AppModel} from './appModel'

export function activate(context: vscode.ExtensionContext) {
   const appModel = new AppModel();

    let OnlineDisposable = vscode.commands.registerCommand('extension.liveServer.goOnline', ()=>{
        appModel.Golive();
    });
    let OfflineDisposable = vscode.commands.registerCommand('extension.liveServer.goOffline', ()=>{
        appModel.goOffline();
    });

   context.subscriptions.push(appModel);
   context.subscriptions.push(OnlineDisposable,OfflineDisposable);
}


export function deactivate() {
    
}