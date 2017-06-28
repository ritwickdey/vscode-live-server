'use strict';
import * as vscode from 'vscode';
import * as LiveServer from 'live-server';
import * as httpShutdown from 'http-shutdown';

export class AppModel
{
    private textEditor: vscode.TextEditor;
    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    private runningServerPort : number;
    private LiveServerInstance;

    constructor() {
        this.IsServerRunning = false;
        this.runningServerPort = null;
        this.Init();
    }

    Init() {

        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,100);
            this.statusBarItem.text = "Go Live";
            this.statusBarItem.command = 'extension.liveServer.goOnline'
            this.statusBarItem.tooltip = "Click to run live server"
            this.statusBarItem.show();
        }
    }

    ToggleStatusBar(){
        if(!this.IsServerRunning) {
            this.statusBarItem.text = `Port : ${this.runningServerPort} - GoOffline`;
            this.statusBarItem.command = 'extension.liveServer.goOffline';
            this.statusBarItem.tooltip = "Click to close server";
        }
        else {
            this.statusBarItem.text = "Go Live";
            this.statusBarItem.command = 'extension.liveServer.goOnline';
            this.statusBarItem.tooltip = "Click to run live server";
        }

        this.IsServerRunning = !this.IsServerRunning;
    }

    Golive() {

        if(this.IsServerRunning)
        {
            vscode.window.showInformationMessage(`Server is already running...`);
            return;
        }

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(`Open Document...`);
            return;
        }
        this.textEditor = editor;

        let WorkSpacePath = vscode.workspace.rootPath;
        let FullFilePath = this.textEditor.document.fileName;
        let documentPath = FullFilePath.substring(0, FullFilePath.lastIndexOf('\\'));
        
        let rootPath = WorkSpacePath ? WorkSpacePath : documentPath;
        let fileName = FullFilePath.substring(FullFilePath.lastIndexOf('\\')+1,FullFilePath.length);
        let fileExtension = fileName.substring(fileName.lastIndexOf("."), fileName.length).toLowerCase();

        if(fileExtension != "html") fileName = null;

        let params = {
            port: 3500, 
            host: '127.0.0.1',
            root: rootPath,
            file : fileName,
            open: true,
        }

        this.LiveServerInstance = LiveServer.start(params);
        
        setTimeout(()=>{
            let port = LiveServer.server.address().port;
            if(!isNaN(port)){
                vscode.window.showInformationMessage(`Server is Started at port : ${port}`);
                this.runningServerPort = port;
                this.ToggleStatusBar();
                httpShutdown(this.LiveServerInstance)
            }
            else
            {
                vscode.window.showErrorMessage(`Error to open server`);
            }
        },500);
    }

    goOffline() {
        if(!this.IsServerRunning)
        {
            vscode.window.showInformationMessage(`Server is not already running`);
            return;
        }
        
        this.LiveServerInstance.shutdown();
        this.LiveServerInstance.close();
        vscode.window.showInformationMessage("Server is now offline.");
        this.ToggleStatusBar();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}


