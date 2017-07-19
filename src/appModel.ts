'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as opn from 'opn';
import { LiveServerClass } from './LiveServer';

export class AppModel {

    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    private LiveServerInstance;


    constructor() {
        this.IsServerRunning = false;
        this.HaveAnyHTMLFile(() => {
            this.Init();
        })

    }

    public Init() {

        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
            this.statusBarItem.text = '$(broadcast) Go Live';
            this.statusBarItem.command = 'extension.liveServer.goOnline'
            this.statusBarItem.tooltip = 'Click to run live server'
            this.statusBarItem.show();
        }
    }


    public Golive() {

        if (this.IsServerRunning) {
            let port = this.LiveServerInstance.address().port;
            vscode.window.showInformationMessage(`Server is already running at port ${port} ...`);
            return;
        }
        let file = this.ExtractFilePath();
        if (!file) {
            vscode.window.showInformationMessage(`Open Document...`);
            return;
        }
        vscode.workspace.saveAll().then(() => {

            if (file.HasVirtualRootError) {
                vscode.window.showErrorMessage('Invaild Path in liveServer.settings.root. live Server Starts from workspace root');
            }

            let portNo = vscode.workspace.getConfiguration('liveServer.settings').get('port') as Number;

            let params = {
                port: portNo,
                host: '127.0.0.1',
                root: file.rootPath,
                file: null,
                open: false
            }
            this.Init();
            LiveServerClass.StartServer(params, (ServerInstance) => {
                if (ServerInstance != null) {
                    this.LiveServerInstance = ServerInstance;
                    let port = ServerInstance.address().port;
                    this.ToggleStatusBar();
                    vscode.window.showInformationMessage(`Server is Started at port : ${port}`);
                    this.openBrowser('127.0.0.1', port, file.filePathFromRoot);
                }
                else {
                    vscode.window.showErrorMessage(`Error to open server`);
                }

            });

        });

        this.ShowProcessRunning();

    }

    public goOffline() {
        if (!this.IsServerRunning) {
            vscode.window.showInformationMessage(`Server is not already running`);
            return;
        }
        this.Init();
        LiveServerClass.StopServer(this.LiveServerInstance, () => {
            vscode.window.showInformationMessage('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
        });

        this.ShowProcessRunning();

    }

    private ToggleStatusBar() {
        if (!this.IsServerRunning) {
            let port = this.LiveServerInstance.address().port
            this.statusBarItem.text = `$(circle-slash) Port : ${port} - GoOffline`;
            this.statusBarItem.command = 'extension.liveServer.goOffline';
            this.statusBarItem.tooltip = 'Click to close server';
        }
        else {
            this.statusBarItem.text = '$(broadcast) Go Live';
            this.statusBarItem.command = 'extension.liveServer.goOnline';
            this.statusBarItem.tooltip = 'Click to run live server';
        }

        this.IsServerRunning = !this.IsServerRunning;
    }

    private ExtractFilePath() {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) return null;

        let WorkSpacePath = vscode.workspace.rootPath;
        let FullFilePath = textEditor.document.fileName;
        let documentPath = FullFilePath.substring(0, FullFilePath.lastIndexOf('\\'));
        let rootPath = WorkSpacePath ? WorkSpacePath : documentPath;

        let virtualRoot = vscode.workspace.getConfiguration('liveServer.settings').get('root') as string;
        if (!virtualRoot.startsWith('/')) {
            virtualRoot = '/' + virtualRoot;
        }
        virtualRoot = virtualRoot.replace(/\//gi, '\\');
        virtualRoot = rootPath + virtualRoot;
        if (virtualRoot.endsWith('\\')) {
            virtualRoot = virtualRoot.substring(0, virtualRoot.length - 1);
        }

        let HasVirtualRootError: boolean;
        if (fs.existsSync(virtualRoot)) {
            rootPath = virtualRoot;
            HasVirtualRootError = false;
        }
        else {
            HasVirtualRootError = true;
        }

        let filePathFromRoot: string;
        if (!FullFilePath.endsWith('.html') && HasVirtualRootError) {
            filePathFromRoot = null;
        }
        else {
            filePathFromRoot = FullFilePath.substring(rootPath.length, FullFilePath.length);
        }

        return {
            HasVirtualRootError: HasVirtualRootError,
            rootPath: rootPath,
            filePathFromRoot: filePathFromRoot
        };
    }

    private ShowProcessRunning() {
        this.statusBarItem.text = '$(pulse) Working on it...';
        this.statusBarItem.tooltip = 'In case if it takes long time, try to close all browser window.';
        this.statusBarItem.command = null;
    }

    private HaveAnyHTMLFile(callback) {
        vscode.workspace.findFiles('**/*.html', '**/node_modules/**', 1).then((files) => {
            if (files !== undefined && files.length !== 0) {
                callback();
                return;
            }
            if (vscode.window.activeTextEditor === undefined) return;
            if (vscode.workspace.rootPath === undefined && vscode.window.activeTextEditor.document.languageId === 'html') {
                callback();
            }
        });
    }

    private openBrowser(host: string, port: number, path: string) {

        let configSettings = vscode.workspace.getConfiguration('liveServer.settings');
        let appConfig: string[] = [];
        let advanceCustomBrowserCmd = configSettings.get("AdvanceCustomBrowserCmdLine") as string;
        if (path.startsWith('\\')) {
            path = path.substring(1, path.length);
        }
        path.replace(/\\/gi, '/');

        if (advanceCustomBrowserCmd) {
            let commands = advanceCustomBrowserCmd.split(' ');
            commands.forEach((command) => {
                if (command) {
                    appConfig.push(command);
                }
            });
        }
        else {
            let CustomBrowser = configSettings.get('CustomBrowser') as string;
            let ChromeDebuggingAttachmentEnable = configSettings.get('ChromeDebuggingAttachment') as boolean;

            if (CustomBrowser !== 'null') {
                appConfig.push(CustomBrowser);

                if (CustomBrowser === 'chrome' && ChromeDebuggingAttachmentEnable) {
                    appConfig.push("--remote-debugging-port=9222");
                }
            }
        }

        if (appConfig[0] && appConfig[0] === 'chrome') {
            switch (process.platform) {
                case 'darwin':
                    appConfig[0] = 'google chrome';
                    break;
                case 'linux':
                    appConfig[0] = 'google-chrome';
                    break;
                case 'win32':
                    appConfig[0] = 'chrome';
                    break;
                default:
                    appConfig[0] = 'chrome';

            }
        }
        else if (appConfig[0] && appConfig[0].startsWith("microsoft-edge")) {
            appConfig[0] = `microsoft-edge:http://${host}:${port}/${path}`;
        }

        opn(`http://${host}:${port}/${path}`, { app: appConfig });
    }



    public dispose() {
        this.statusBarItem.dispose();
    }
}


