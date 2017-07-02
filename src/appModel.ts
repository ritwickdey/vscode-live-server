'use strict';
import * as vscode from 'vscode';
import { LiveServerClass } from './LiveServer';

export class AppModel{

    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    private LiveServerInstance;

    constructor() {
        this.IsServerRunning = false;
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

    ToggleStatusBar() {
        if(!this.IsServerRunning) {
            let port = this.LiveServerInstance.address().port
            this.statusBarItem.text = `Port : ${port} - GoOffline`;
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

        if(this.IsServerRunning) {
            let port = this.LiveServerInstance.address().port;
            vscode.window.showInformationMessage(`Server is already running at port ${port} ...`);
            return;
        }

        let file = this.ExtractFilePath();
        if(!file) {
            vscode.window.showInformationMessage(`Open Document...`);
            return;
        }

        let portNo = vscode.workspace.getConfiguration("liveServer.settings").get("port") as Number;
        
        let params = {
            port: portNo, 
            host: '127.0.0.1',
            root: file.rootPath,
            file : file.fileName,
            open: true
        }

        LiveServerClass.StartServer(params,(ServerInstance) => {
            if(ServerInstance != null) {
                this.LiveServerInstance = ServerInstance;
                let port = ServerInstance.address().port;
                this.ToggleStatusBar();
                vscode.window.showInformationMessage(`Server is Started at port : ${port}`);
            }
            else {
                vscode.window.showErrorMessage(`Error to open server`);
            }

        });

        this.ShowProcessRunning();
        
    }

    goOffline() {
        if(!this.IsServerRunning)
        {
            vscode.window.showInformationMessage(`Server is not already running`);
            return;
        }
        
        LiveServerClass.StopServer(this.LiveServerInstance, ()=>{
            vscode.window.showInformationMessage("Server is now offline.");
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
        });

        this.ShowProcessRunning();

    }


    ExtractFilePath() {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) return null;
        
        let WorkSpacePath = vscode.workspace.rootPath;
        let FullFilePath = textEditor.document.fileName;
        let documentPath = FullFilePath.substring(0, FullFilePath.lastIndexOf('\\'));
        
        let rootPath = WorkSpacePath ? WorkSpacePath : documentPath;
        let fileName = FullFilePath.substring(FullFilePath.lastIndexOf('\\')+1,FullFilePath.length);
        let fileExtension = fileName.substring(fileName.lastIndexOf("."), fileName.length).toLowerCase();

        if(fileExtension != ".html") fileName = null;

        return {
            rootPath : rootPath,
            fileName : fileName
        };
    }

    ShowProcessRunning(){
        this.statusBarItem.text = "Working...";
        this.statusBarItem.tooltip = "In case if it takes long time, try to close all browser window.";
        this.statusBarItem.command = null;
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}


