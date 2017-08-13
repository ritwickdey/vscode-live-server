'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as opn from 'opn';

import { LiveServerHelper } from './LiveServerHelper';
import { StatusbarUi } from './StatusbarUi';
import { Config } from './Config';
import { Helper } from './Helper';

export class AppModel {

    private IsServerRunning: boolean;
    private LiveServerInstance;
    private runningPort: number;

    constructor() {
        this.IsServerRunning = false;
        this.HaveAnyHTMLFile(() => {
            this.Init();
        })

    }

    public Init() {
        StatusbarUi.Init();
    }

    public Golive() {

        if (this.IsServerRunning) {
            let port = this.LiveServerInstance.address().port;
            vscode.window.showInformationMessage(`Server is already running at port ${port} ...`);
            return;
        }
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage(`Open a file...`);
            return;
        }
        const workspacePath = vscode.workspace.rootPath || '';
        const openDocUri = vscode.window.activeTextEditor.document.fileName;
        let file = Helper.ExtractFilePath(workspacePath, openDocUri, Config.getRoot);
        
        if (file.HasVirtualRootError) {
            vscode.window.showErrorMessage('Invaild Path in liveServer.settings.root settings. live Server will start from workspace root');
        }

        let ignoreFilePaths = Config.getIgnoreFiles || [];
        let params = Helper.generateParams(file.rootPath,Config.getPort,ignoreFilePaths,workspacePath);
        this.Init();
        LiveServerHelper.StartServer(params, (ServerInstance) => {
            if (ServerInstance && ServerInstance.address()) {
                this.LiveServerInstance = ServerInstance;
                this.runningPort = ServerInstance.address().port;
                this.ToggleStatusBar();
                vscode.window.showInformationMessage(`Server is Started at port : ${this.runningPort}`);
                let filePathFromRoot = Helper.relativeHtmlPathFromRoot(file.rootPath, openDocUri)
                this.openBrowser('127.0.0.1', this.runningPort, filePathFromRoot || "");
            }
            else {
                vscode.window.showErrorMessage(`Error to open server at port ${Config.getPort}.`);
                this.IsServerRunning = true; //to revert
                this.ToggleStatusBar(); //reverted
                return;
            }

        });


        StatusbarUi.Working("Starting...");
    }

    public GoOffline() {
        if (!this.IsServerRunning) {
            vscode.window.showInformationMessage(`Server is not already running`);
            return;
        }
        this.Init();
        LiveServerHelper.StopServer(this.LiveServerInstance, () => {
            vscode.window.showInformationMessage('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
            this.runningPort = 0;
        });

        StatusbarUi.Working("Disposing...");

    }

    private ToggleStatusBar() {
        if (!this.IsServerRunning) {
            StatusbarUi.Offline(this.runningPort || Config.getPort);
        }
        else {
            StatusbarUi.Live();
        }

        this.IsServerRunning = !this.IsServerRunning;
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
        if (Config.getNoBrowser) return;

        let appConfig: string[] = [];
        let advanceCustomBrowserCmd = Config.getAdvancedBrowserCmdline;
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
            let CustomBrowser = Config.getCustomBrowser;
            let ChromeDebuggingAttachmentEnable = Config.getChromeDebuggingAttachment;

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
        StatusbarUi.dispose();
    }
}


