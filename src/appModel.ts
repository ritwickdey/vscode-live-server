'use strict';

import { window, workspace } from 'vscode';
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
        this.runningPort = null;

        this.HaveAnyHTMLFile(() => {
            StatusbarUi.Init();
        })

    }

    public Golive() {

        if (!window.activeTextEditor && !workspace.rootPath) {
            this.showPopUpMsg(`Open a file or folder...`,true);
            return;
        }

        const workspacePath = workspace.rootPath || '';
        const openedDocUri = window.activeTextEditor ? window.activeTextEditor.document.fileName : '';
        let pathInfos = Helper.ExtractFilePath(workspacePath, openedDocUri, Config.getRoot);

        if (this.IsServerRunning) {
            this.openBrowser(this.runningPort,
                Helper.relativeHtmlPathFromRoot(pathInfos.rootPath, openedDocUri) || "");
            return;
        }
        if (pathInfos.HasVirtualRootError) {
            this.showPopUpMsg('Invaild Path in liveServer.settings.root settings. live Server will serve from workspace root', true);
        }

        let params = Helper.generateParams(pathInfos.rootPath, Config.getPort,
            Config.getIgnoreFiles, workspacePath);

        LiveServerHelper.StartServer(params, (serverInstance) => {
            if (serverInstance && serverInstance.address()) {
                this.LiveServerInstance = serverInstance;
                this.runningPort = serverInstance.address().port;
                this.ToggleStatusBar();
                this.showPopUpMsg(`Server is Started at port : ${this.runningPort}`);

                if (!Config.getNoBrowser) {
                    this.openBrowser(this.runningPort,
                        Helper.relativeHtmlPathFromRoot(pathInfos.rootPath, openedDocUri) || "");
                }
            }
            else {
                this.showPopUpMsg(`Error to open server at port ${Config.getPort}.`, true);
                this.IsServerRunning = true; //to revert status - cheat :p 
                this.ToggleStatusBar(); //reverted
            }

        });


        StatusbarUi.Working("Starting...");
    }

    public GoOffline() {
        if (!this.IsServerRunning) {
            this.showPopUpMsg(`Server is not already running`);
            return;
        }
        // this.Init();
        LiveServerHelper.StopServer(this.LiveServerInstance, () => {
            this.showPopUpMsg('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
            this.runningPort = null;
        });

        StatusbarUi.Working("Disposing...");

    }

    private showPopUpMsg(msg: string, isErrorMsg: boolean = false) {
        if (isErrorMsg) {
            window.showErrorMessage(msg);
        }
        else {
            if (!Config.getDonotShowInfoMsg) {
                const donotShowMsg = "Don't show again";
                window.showInformationMessage(msg, donotShowMsg)
                    .then((choise) => {
                        if (choise && choise === donotShowMsg) {
                            Config.setDonotShowInfoMsg = true;
                        }
                    });
            }
        }
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
        workspace.findFiles('**/*[.html | .htm]', '**/node_modules/**', 1).then((files) => {
            if (files !== undefined && files.length !== 0) {
                return callback();
            }

            let textEditor = window.activeTextEditor;
            if (!textEditor) return;

            //If a HTML file open without Workspace
            if (workspace.rootPath === undefined && textEditor.document.languageId === 'html') {
                return callback();
            }
        });
    }

    private openBrowser(port: number, path: string) {
        const host = '127.0.0.1';

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
            opn(`http://${host}:${port}/${path}`, { app: appConfig || [''] });
        } catch (error) {
            this.showPopUpMsg(`Server is started at ${this.runningPort} but failed to open browser. See error on console.`, true);
            console.log("\n\nError Log to open Browser : ", error);
            console.log("\n\n");
        }
    }

    public dispose() {
        StatusbarUi.dispose();
    }
}


