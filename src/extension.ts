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

    let ActiveTextEditorDisposable = vscode.window.onDidChangeActiveTextEditor(()=>{
        if(vscode.window.activeTextEditor == undefined) return;
        if(vscode.workspace.rootPath == undefined && vscode.window.activeTextEditor.document.languageId == 'html'){
           appModel.Init();
        }
    });

    context.subscriptions.push(ActiveTextEditorDisposable);
    context.subscriptions.push(appModel);
    context.subscriptions.push(OnlineDisposable,OfflineDisposable);
}


export function deactivate() {
    
}