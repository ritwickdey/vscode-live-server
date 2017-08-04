'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as opn from 'opn';
import { LiveServerClass } from './LiveServer';

export class AppModel {

    private statusBarItem: vscode.StatusBarItem;
    private IsServerRunning: boolean;
    private LiveServerInstance;

    get configSettings() {
        return vscode.workspace.getConfiguration('liveServer.settings');
    }

    constructor() {
        this.IsServerRunning = false;
        this.HaveAnyHTMLFile(() => {
            this.Init();
        })

    }

    public Init() {

        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
            this.goLiveUI();
            this.statusBarItem.show();
        }
    }

    public goLiveUI() {
        this.statusBarItem.text = '$(broadcast) Go Live';
        this.statusBarItem.command = 'extension.liveServer.goOnline';
        this.statusBarItem.tooltip = 'Click to run live server'
    }

    public goOfflineUI() {
        let port = this.LiveServerInstance.address().port
        this.statusBarItem.text = `$(circle-slash) Port : ${port} - GoOffline`;
        this.statusBarItem.command = 'extension.liveServer.goOffline';
        this.statusBarItem.tooltip = 'Click to close server';
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

            let portNo = this.configSettings.get('port') as Number;

            let ignoreFilePaths = this.configSettings.get("ignoreFiles") as string[] || [];
            const workspacePath = file.WorkSpacePath || '';
            ignoreFilePaths.forEach((ignoredFilePath, index, thisArr) => {
                if (!ignoredFilePath.startsWith('/') || !ignoredFilePath.startsWith('\\')) {
                    if (process.platform === 'win32') {
                        thisArr[index] = '\\'+ ignoredFilePath;
                    }
                    else {
                        thisArr[index] = '/'+ ignoredFilePath;
                    }
                }

                thisArr[index] = workspacePath + thisArr[index];
            });

            let params = {
                port: portNo,
                host: '0.0.0.0',
                root: file.rootPath,
                file: null,
                open: false,
                ignore: ignoreFilePaths
            }
            this.Init();
            LiveServerClass.StartServer(params, (ServerInstance) => {
                if (ServerInstance && ServerInstance.address()) {

                    this.LiveServerInstance = ServerInstance;
                    let port = ServerInstance.address().port;
                    this.ToggleStatusBar();
                    vscode.window.showInformationMessage(`Server is Started at port : ${port}`);
                    this.openBrowser('127.0.0.1', port, file.filePathFromRoot || "");
                }
                else {
                    let port = this.configSettings.get('port') as Number;
                    vscode.window.showErrorMessage(`Error to open server at port ${port}.`);
                    this.IsServerRunning = true; //to revert
                    this.ToggleStatusBar(); //reverted
                    return;
                }

            });

        });

        this.ShowProcessRunning();

    }

    public GoOffline() {
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
            this.goOfflineUI();
        }
        else {
            this.goLiveUI();
        }

        this.IsServerRunning = !this.IsServerRunning;
    }

    private ExtractFilePath() {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) return null;

        const WorkSpacePath = vscode.workspace.rootPath;
        let FullFilePath = textEditor.document.fileName;
        let documentPath = path.dirname(FullFilePath);

        //if only a single file is opened, WorkSpacePath will be NULL
        let rootPath = WorkSpacePath ? WorkSpacePath : documentPath;

        let virtualRoot = this.configSettings.get('root') as string;
        if (!virtualRoot.startsWith('/')) {
            virtualRoot = '/' + virtualRoot;
        }
        // virtualRoot = virtualRoot.replace(/\//gi, '\\');
        // virtualRoot = rootPath + virtualRoot;
        virtualRoot = path.join(rootPath, virtualRoot);
        // if (virtualRoot.endsWith('\\')) {
        //     virtualRoot = virtualRoot.substring(0, virtualRoot.length - 1);
        // }

        let HasVirtualRootError: boolean;
        if (fs.existsSync(virtualRoot)) {
            rootPath = virtualRoot;
            HasVirtualRootError = false;
        }
        else {
            HasVirtualRootError = true;
        }

        let filePathFromRoot: string;
        if (!FullFilePath.endsWith('.html') || HasVirtualRootError || rootPath.length - path.dirname(FullFilePath || '').length > 1) {
            filePathFromRoot = null;
        }
        else {
            filePathFromRoot = FullFilePath.substring(rootPath.length, FullFilePath.length);

        }

        if (process.platform === 'win32') {
            if (!rootPath.endsWith('\\'))
                rootPath = rootPath + '\\';
        }
        else {
            if (!rootPath.endsWith('/'))
                rootPath = rootPath + '/';
        }

        return {
            HasVirtualRootError: HasVirtualRootError,
            rootPath: rootPath,
            filePathFromRoot: filePathFromRoot,
            WorkSpacePath: WorkSpacePath
        };
    }

    private ShowProcessRunning() {
        this.statusBarItem.text = '$(pulse) Working on it...';
        this.statusBarItem.tooltip = 'In case if it takes long time, try to close all browser window.';
        this.statusBarItem.command = null;
    }

    private HaveAnyHTMLFile(callback) {
        vscode.workspace.findFiles('**/*[.html | .htm]', '**/node_modules/**', 1).then((files) => {
            if (files !== undefined && files.length !== 0) {
                callback();
                return;
            }

            let textEditor = vscode.window.activeTextEditor;
            if (!textEditor) return;

            //If a HTML file open without Workspace
            if (vscode.workspace.rootPath === undefined && textEditor.document.languageId === 'html') {
                callback();
                return;
            }
        });
    }

    private openBrowser(host: string, port: number, path: string) {
        if (this.configSettings.get("NoBrowser") as boolean) return;

        let appConfig: string[] = [];
        let advanceCustomBrowserCmd = this.configSettings.get("AdvanceCustomBrowserCmdLine") as string;
        if (path.startsWith('\\') || path.startsWith('/')) {
            path = path.substring(1, path.length);
        }
        path = path.replace(/\\/gi, '/');

        if (advanceCustomBrowserCmd) {
            let commands = advanceCustomBrowserCmd.split(' ');
            commands.forEach((command) => {
                if (command) {
                    appConfig.push(command);
                }
            });
        }
        else {
            let CustomBrowser = this.configSettings.get('CustomBrowser') as string;
            let ChromeDebuggingAttachmentEnable = this.configSettings.get('ChromeDebuggingAttachment') as boolean;

            if (CustomBrowser && CustomBrowser !== 'null') {
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

        try {
            opn(`http://${host}:${port}/${path}`, { app: appConfig || [] });
        } catch (error) {
            vscode.window.showErrorMessage(`Error to open browser. See error on console`);
            console.log("\n\nError Log to open Browser : ", error);
            console.log("\n\n");
        }
    }



    public dispose() {
        this.statusBarItem.dispose();
    }
}


