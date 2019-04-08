'use strict';

import { commands, window, workspace, Event, EventEmitter } from 'vscode';

import { LiveServerHelper } from './LiveServerHelper';
import { StatusbarUi } from './StatusbarUi';
import { Config } from './Config';
import { Helper, SUPPRORTED_EXT } from './Helper';
import { workspaceResolver, setOrChangeWorkspace } from './workspaceResolver';
import { IAppModel, GoLiveEvent, GoOfflineEvent } from './IAppModel';
import { LiveShareHelper } from './LiveShareHelper';

import * as opn from 'opn';
import * as ips from 'ips';

export class AppModel implements IAppModel {

    private IsServerRunning: boolean;
    private IsStaging: boolean;
    private LiveServerInstance;
    private localIps: any;
    private previousWorkspacePath: string;

    private readonly goLiveEvent = new EventEmitter<GoLiveEvent>();
    private readonly goOfflineEvent = new EventEmitter<GoOfflineEvent>();
    private readonly liveShareHelper: LiveShareHelper;

    public runningPort: number;

    public get onDidGoLive(): Event<GoLiveEvent> {
        return this.goLiveEvent.event;
    }
    public get onDidGoOffline(): Event<GoOfflineEvent> {
        return this.goOfflineEvent.event;
    }

    constructor() {
        const _ips = ips();
        this.localIps = _ips.local ? _ips.local : Config.getHost;
        this.IsServerRunning = false;
        this.runningPort = null;

        this.liveShareHelper = new LiveShareHelper(this);

        this.haveAnySupportedFile().then(() => {
            StatusbarUi.Init();
        });
    }

    public async Golive(pathUri?: string) {

        // if no folder is opened.
        if (!workspace.workspaceFolders) {
            return this.showPopUpMsg(`Open a folder or workspace... (File -> Open Folder)`, true);
        }

        if (!workspace.workspaceFolders.length) {
            return this.showPopUpMsg(`You've not added any folder in the workspace`, true);
        }

        const workspacePath = await workspaceResolver(pathUri);

        if (!this.isCorrectWorkspace(workspacePath)) return;

        const openedDocUri = pathUri || (window.activeTextEditor ? window.activeTextEditor.document.fileName : '');
        const pathInfos = Helper.testPathWithRoot(workspacePath);

        if (this.IsServerRunning) {
            const relativePath = Helper.getSubPath(pathInfos.rootPath, openedDocUri) || '';
            this.goLiveEvent.fire({ runningPort: this.runningPort, pathUri: relativePath });
            return this.openBrowser(
                this.runningPort,
                relativePath
            );
        }
        if (pathInfos.isNotOkay) {
            this.showPopUpMsg('Invaild Path in liveServer.settings.root settings. live Server will serve from workspace root', true);
        }

        if (this.IsStaging) return;

        let params = Helper.generateParams(pathInfos.rootPath, workspacePath, () => {
            this.tagMissedCallback();
        });

        LiveServerHelper.StartServer(params, async (serverInstance) => {
            if (serverInstance && serverInstance.address) {
                this.LiveServerInstance = serverInstance;
                this.runningPort = serverInstance.address().port;
                this.ToggleStatusBar();
                this.showPopUpMsg(`Server is Started at port : ${this.runningPort}`);

                if (!Config.getNoBrowser) {
                    const relativePath = Helper.getSubPath(pathInfos.rootPath, openedDocUri) || '';
                    this.goLiveEvent.fire({ runningPort: this.runningPort, pathUri: relativePath });
                    this.openBrowser(
                        this.runningPort,
                        relativePath
                    );
                }
            }
            else {
                if (!serverInstance.errorMsg) {
                    await Config.setPort(Config.getPort + 1); // + 1 will be fine
                    this.showPopUpMsg(`The default port : ${Config.getPort - 1} is currently taken, changing port to : ${Config.getPort}.`);
                    this.Golive(pathUri);
                } else {
                    this.showPopUpMsg(`Something is went wrong! Please check into Developer Console or report on GitHub.`, true);
                }
                this.IsServerRunning = true; // to revert status - cheat :p
                this.ToggleStatusBar(); // reverted
            }
        });

        this.IsStaging = true;
        StatusbarUi.Working('Starting...');
    }

    public GoOffline() {
        if (this.IsStaging) return;
        if (!this.IsServerRunning) {
            this.showPopUpMsg(`Server is not already running`);
            return;
        }
        this.goOfflineEvent.fire({ runningPort: this.runningPort });
        LiveServerHelper.StopServer(this.LiveServerInstance, () => {
            this.showPopUpMsg('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
            this.runningPort = null;
            this.previousWorkspacePath = null;
        });
        this.IsStaging = true;

        StatusbarUi.Working('Disposing...');

    }

    changeWorkspaceRoot() {
        setOrChangeWorkspace()
            .then(workspceName => {
                if (workspceName === undefined) return;
                window.showInformationMessage(`Success! '${workspceName}' workspace is now root of Live Server`);
                // If server is running, Turn off the server.
                if (this.IsServerRunning)
                    this.GoOffline();
            });
    }


    private isCorrectWorkspace(workspacePath: string) {
        if (
            this.IsServerRunning &&
            this.previousWorkspacePath &&
            this.previousWorkspacePath !== workspacePath
        ) {
            this.showPopUpMsg(`Server is already running from different workspace.`, true);
            return false;
        }
        else this.previousWorkspacePath = workspacePath;
        return true;
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
                .then(choice => {
                    if (choice && choice === donotShowMsg) {
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

    private haveAnySupportedFile() {
        return new Promise<void>(resolve => {
            const globFormat = `**/*[${SUPPRORTED_EXT.join(' | ')}]`;
            workspace.findFiles(globFormat, '**/node_modules/**', 1)
                .then(async (files) => {
                    if (files && files.length) return resolve();
                });
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

        let useBrowserPreview = Config.getUseBrowserPreview;
        if (useBrowserPreview) {
            let url = `${protocol}://${host}:${port}/${path}`;
            let onSuccess = () => {};
            let onError = (err) => {
                this.showPopUpMsg(`Server is started at ${this.runningPort} but failed to open in Browser Preview. Got Browser Preview extension installed?`, true);
                console.log('\n\nError Log to open Browser : ', err);
                console.log('\n\n');
            };
            commands.executeCommand(`browser-preview.openPreview`, url).then(onSuccess, onError);
            return;
        }

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

            if (CustomBrowser && CustomBrowser !== 'null' /*For backward capability*/) {
                let browserDetails = CustomBrowser.split(':');
                let browserName = browserDetails[0];
                params.push(browserName);

                if (browserDetails[1] && browserDetails[1] === 'PrivateMode') {
                    if (browserName === 'chrome' || browserName === 'blisk')
                        params.push('--incognito');
                    else if (browserName === 'firefox')
                        params.push('--private-window');
                }

                if ((browserName === 'chrome' || browserName === 'blisk') && ChromeDebuggingAttachmentEnable) {
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
        } else if (params[0] && params[0].startsWith('microsoft-edge')) {
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


