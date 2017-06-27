'use strict';
import * as vscode from 'vscode';
import * as LiveServer from 'live-server';

export class AppModel
{
    private textEditor: vscode.TextEditor;
    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    constructor() {
        this.IsServerRunning = false;
        this.Init();
    }

    Init() {

        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,100);
            this.statusBarItem.text = "GoLiveServer";
            this.statusBarItem.command = 'extension.liveServer.goOnline'
            this.statusBarItem.show();
        }
    }

    ToggleStatusBar(){
        if(this.statusBarItem.text == "GoLiveServer") {
            this.statusBarItem.text = "GoOfflineServer";
            this.statusBarItem.command = 'extension.liveServer.goOffline';
        }
        else {
            this.statusBarItem.text = "GoLiveServer";
            this.statusBarItem.command = 'extension.liveServer.goOnline';
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
        let fileName = this.textEditor.document.fileName.substring(FullFilePath.lastIndexOf('\\')+1,FullFilePath.length);

        var params = {
            port: 3500, 
            host: '127.0.0.1',
            root: rootPath,
            file : fileName,
            open: true,
        }

        LiveServer.start(params);
        vscode.window.showInformationMessage(`Server is Started.`);
        this.ToggleStatusBar();
        console.log(LiveServer.server);
    }

    goOffline() {
        if(!this.IsServerRunning)
        {
            vscode.window.showInformationMessage(`Server is not already running`);
            return;
        }
        LiveServer.shutdown();
        vscode.window.showInformationMessage("Server is now offline.");
        this.ToggleStatusBar();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}


/** 
  var params ={
        port: 8181, // Set the server port. Defaults to 8080.
        host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: "/public", // Set root directory that's being served. Defaults to cwd.
        open: false, // When false, it won't load your browser by default.
        ignore: 'scss,my/templates', // comma-separated string for paths to ignore
        file: "index.html", // When set, serve this file for every 404 (useful for single-page applications)
        wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
        mount: [['/components', './node_modules']], // Mount a directory to a route.
        logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
        middleware: [function(req, res, next) { next(); }]  
    }
 */