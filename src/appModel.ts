'use strict';

import { window, workspace, TextDocumentChangeEvent } from 'vscode';

import { LiveServerHelper } from './LiveServerHelper';
import { StatusbarUi } from './StatusbarUi';
import { Config } from './Config';
import { Helper, SUPPRORTED_EXT } from './Helper';

import * as opn from 'opn';
import * as ips from 'ips';

export class AppModel {

    private IsServerRunning: boolean;
    private IsStaging: boolean;
    private LiveServerInstance;
    private runningPort: number;
    private localIps: any;

    constructor() {
        const _ips = ips();
        this.localIps = _ips.local ? _ips.local : Config.getHost;
        this.IsServerRunning = false;
        this.runningPort = null;

        this.HaveAnySupportedFile(() => {
            StatusbarUi.Init();
        });
    }

    public Golive(pathUri?: string) {

        if (!window.activeTextEditor && !workspace.rootPath) {
            this.showPopUpMsg(`Open a file or folder...`, true);
            return;
        }

        const workspacePath = workspace.rootPath || '';
        const openedDocUri = pathUri || (window.activeTextEditor ? window.activeTextEditor.document.fileName : '');
        let pathInfos = Helper.ExtractFilePath(workspacePath, openedDocUri, Config.getRoot);

        if (this.IsServerRunning) {
            this.openBrowser(this.runningPort,
                Helper.getSubPathIfSupported(pathInfos.rootPath, openedDocUri) || '');
            return;
        }
        if (pathInfos.HasVirtualRootError) {
            this.showPopUpMsg('Invaild Path in liveServer.settings.root settings. live Server will serve from workspace root', true);
        }

        if (this.IsStaging) return;

        let params = Helper.generateParams(pathInfos.rootPath, workspacePath, () => {
            this.tagMissedCallback();
        });

        LiveServerHelper.StartServer(params, (serverInstance) => {
            if (serverInstance && serverInstance.address) {
                this.LiveServerInstance = serverInstance;
                this.runningPort = serverInstance.address().port;
                this.ToggleStatusBar();
                this.showPopUpMsg(`Server is Started at port : ${this.runningPort}`);

                if (!Config.getNoBrowser) {
                    this.openBrowser(this.runningPort,
                        Helper.getSubPathIfSupported(pathInfos.rootPath, openedDocUri) || '');
                }
            }
            else {
                if (!serverInstance.errorMsg)
                    this.showPopUpMsg(`Error on port ${Config.getPort}. Please try to change the port through settings or report on GitHub.`, true);
                else
                    this.showPopUpMsg(`Something is went wrong! Please check into Developer Console or report on GitHub.`, true);
                this.IsServerRunning = true; // to revert status - cheat :p
                this.ToggleStatusBar(); // reverted
            }
        });

        this.IsStaging = true;
        StatusbarUi.Working('Starting...');

        // live editing
        if (Config.getLiveEditing && Config.getExpLiveEditing) {
            const liveServerHelper = new LiveServerHelper();
            workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
                liveServerHelper.emit('liveEditing', e, window.activeTextEditor.document.getText());
            });
        }
    }

    public GoOffline() {
        if (this.IsStaging) return;
        if (!this.IsServerRunning) {
            this.showPopUpMsg(`Server is not already running`);
            return;
        }
        LiveServerHelper.StopServer(this.LiveServerInstance, () => {
            this.showPopUpMsg('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
            this.runningPort = null;
        });
        this.IsStaging = true;

        StatusbarUi.Working('Disposing...');

    }

    private tagMissedCallback() {
        this.showPopUpMsg('Live Reload is not possible without body or head tag.', null, true);
    }

    private showPopUpMsg(msg: string, isErrorMsg: boolean = false, isWarning: boolean = false) {
        if (isErrorMsg) {
            window.showErrorMessage(msg);
        }
        else if (isWarning && !Config.getDonotVerifyTags) {
            const donotShowMsg = 'I understand, Don\'t show again';
            window.showWarningMessage(msg, donotShowMsg)
                .then(choise => {
                    if (choise && choise === donotShowMsg) {
                        Config.setDonotVerifyTags(true, true);
                    }
                });
        }
        else if (!Config.getDonotShowInfoMsg) {
            const donotShowMsg = 'Don\'t show again';
            window.showInformationMessage(msg, donotShowMsg)
                .then(choise => {
                    if (choise && choise === donotShowMsg) {
                        Config.setDonotShowInfoMsg(true, true);
                    }
                });
        }


    }

    private ToggleStatusBar() {
        this.IsStaging = false;
        if (!this.IsServerRunning) {
            StatusbarUi.Offline(this.runningPort || Config.getPort);
        }
        else {
            StatusbarUi.Live();
        }

        this.IsServerRunning = !this.IsServerRunning;
    }

    private HaveAnySupportedFile(callback) {
        const globFormat = `**/*[${SUPPRORTED_EXT.join(' | ')}]`;
        workspace.findFiles(globFormat, '**/node_modules/**').then((files) => {
            if (files && files.length !== 0) {
                return callback();
            }

            let textEditor = window.activeTextEditor;
            if (!textEditor) return;

            // If a HTML file open without Workspace
            if (workspace.rootPath === undefined && Helper.IsSupportedFile(textEditor.document.fileName)) {
                return callback();
            }
        });
    }

    private openBrowser(port: number, path: string) {
        const host = Config.getLocalIp ? this.localIps : Config.getHost;
        const protocol = Config.getHttps.enable ? 'https' : 'http';

        let params: string[] = [];
        let advanceCustomBrowserCmd = Config.getAdvancedBrowserCmdline;
        if (path.startsWith('\\') || path.startsWith('/')) {
            path = path.substring(1, path.length);
        }
        path = path.replace(/\\/gi, '/');

        if (advanceCustomBrowserCmd) {
            advanceCustomBrowserCmd
                .split('--')
                .forEach((command, index) => {
                    if (command) {
                        if (index !== 0) command = '--' + command;
                        params.push(command.trim());
                    }
                });
        }
        else {
            let CustomBrowser = Config.getCustomBrowser;
            let ChromeDebuggingAttachmentEnable = Config.getChromeDebuggingAttachment;

            if (CustomBrowser && CustomBrowser !== 'null') {
                let browserDetails = CustomBrowser.split(':');
                let browserName = browserDetails[0];
                params.push(browserName);

                if (browserDetails[1] && browserDetails[1] === 'PrivateMode') {
                    if (browserName === 'chrome')
                        params.push('--incognito');
                    else if (browserName === 'firefox')
                        params.push('--private-window');
                }

                if (browserName === 'chrome' && ChromeDebuggingAttachmentEnable) {
                    params.push(...[
                        '--new-window',
                        '--no-default-browser-check',
                        '--remote-debugging-port=9222',
                        '--user-data-dir=' + __dirname
                    ]);
                }
            }
        }

        if (params[0] && params[0] === 'chrome') {
            switch (process.platform) {
                case 'darwin':
                    params[0] = 'google chrome';
                    break;
                case 'linux':
                    params[0] = 'google-chrome';
                    break;
                case 'win32':
                    params[0] = 'chrome';
                    break;
                default:
                    params[0] = 'chrome';

            }
        }
        else if (params[0] && params[0].startsWith('microsoft-edge')) {
            params[0] = `microsoft-edge:${protocol}://${host}:${port}/${path}`;
        }

        try {
            opn(`${protocol}://${host}:${port}/${path}`, { app: params || [''] });
        } catch (error) {
            this.showPopUpMsg(`Server is started at ${this.runningPort} but failed to open browser. Try to change the CustomBrowser settings.`, true);
            console.log('\n\nError Log to open Browser : ', error);
            console.log('\n\n');
        }
    }

    public dispose() {
        StatusbarUi.dispose();
    }
}


