'use strict';
import * as vscode from 'vscode';
import * as LiveServer from 'live-server';

export class AppModel
{
    private textEditor: vscode.TextEditor;
    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    private runningServerPort : number;
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

        LiveServer.start(params);
        
        setTimeout(()=>{
            let port = LiveServer.server.address().port;
            if(!isNaN(port)){
                vscode.window.showInformationMessage(`Server is Started at port : ${port}`);
                this.runningServerPort = port;
                this.ToggleStatusBar();
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