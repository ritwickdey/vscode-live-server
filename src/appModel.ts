'use strict';

import { commands, window, workspace, Event, EventEmitter, TreeDataProvider, ExtensionContext, QuickPickItem, TreeView, Uri } from 'vscode';

import { LiveServerHelper } from './LiveServerHelper';
import { StatusbarUi } from './StatusbarUi';
import { Config } from './Config';
import { Helper, SUPPRORTED_EXT } from './Helper';
import { workspaceResolver, setOrChangeWorkspace } from './workspaceResolver';
import { IAppModel, GoLiveEvent, GoOfflineEvent, WSMessage, WSMessageSource, WSMessageEncoding } from './IAppModel';
import { LiveShareHelper } from './LiveShareHelper';

import * as opn from 'opn';
import * as ips from 'ips';
import { HTVFTreeDataProvider, WSCTreeDataProvider, HVFNode } from './LiveTreeDataProvider';
import { ILiveServer, WebSocketConnection } from './ILiveServer';
import { WebsocketManagerPanel, VFSManagerPanel } from './ManagerPage';
import * as path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { fstat, readFileSync } from 'fs';

export class AppModel implements IAppModel {
    private IsServerRunning: boolean;
    private IsStaging: boolean;
    private LiveServerInstance: ILiveServer;
    private localIps: any;
    private previousWorkspacePath: string;
    private vfTreeView: TreeView<HVFNode>;
    private vfTreeDataProvider: HTVFTreeDataProvider;
    private wsTreeDataProvider: WSCTreeDataProvider;
    private wsManagerPanel: WebsocketManagerPanel;
    private vfManagerPanel: VFSManagerPanel;
    private WebSocketMessageHistorys: Array<WSMessage>;
    private AutoSendWSMessage: WSMessage | null;
    private IntervalSendWSMessageTimer: NodeJS.Timer | null;
    private SendWSMessageInterval: number;
    private readonly econtext: ExtensionContext;

    private readonly goLiveEvent = new EventEmitter<GoLiveEvent>();
    private readonly goOfflineEvent = new EventEmitter<GoOfflineEvent>();
    private readonly liveShareHelper: LiveShareHelper;

    public runningPort: number;

    public get liveServer(): ILiveServer {
        return this.LiveServerInstance;
    }
    public get onDidGoLive(): Event<GoLiveEvent> {
        return this.goLiveEvent.event;
    }
    public get onDidGoOffline(): Event<GoOfflineEvent> {
        return this.goOfflineEvent.event;
    }

    constructor(context: ExtensionContext) {
        const _ips = ips();
        this.econtext = context;
        this.localIps = _ips.local ? _ips.local : Config.getHost;
        this.IsServerRunning = false;
        this.runningPort = null;

        this.liveShareHelper = new LiveShareHelper(this);

        this.haveAnySupportedFile().then(() => {
            StatusbarUi.Init();
        });

        this.vfTreeDataProvider = new HTVFTreeDataProvider([
            path.join(context.extensionPath, 'images/dir.svg'),
            path.join(context.extensionPath, 'images/file.svg')
        ]);
        this.wsTreeDataProvider = new WSCTreeDataProvider(this);
        this.vfTreeView = window.createTreeView('live-server-virtual-files', { treeDataProvider: this.vfTreeDataProvider });
        context.subscriptions.push(this.vfTreeView);
        context.subscriptions.push(window.registerTreeDataProvider('live-server-websocket-clients', this.wsTreeDataProvider));
        this.wsManagerPanel = new WebsocketManagerPanel(context.extensionPath);
        this.vfManagerPanel = new VFSManagerPanel(context.extensionPath);
        this.WebSocketMessageHistorys = new Array<WSMessage>();
        this.AutoSendWSMessage = null;
        this.IntervalSendWSMessageTimer = null;
        this.SendWSMessageInterval = 0;

        this.wsManagerPanel.on('websocket.message.send', (clientId: string, encoding: string, message: any) => {
            this.sendMessageToClient(clientId, encoding, message);
        });

        this.wsManagerPanel.on('websocket.client.list', () => {
            this.NotifyWebview_ClientListUpdated();
        });
        this.wsManagerPanel.on('websocket.message.history.load', (index: number, count: number) => {
            this.sendWSMessageHistorys(index, count);
        });
        this.wsManagerPanel.on('websocket.client.options.show', (encoding: string, message: any) => {
            this.showWSMessageOptions(encoding, message);
        });
        this.wsManagerPanel.on('websocket.message.history.clear', () => {
            this.clearWSMessageHistory();
        });

        this.vfManagerPanel.on('vitrual.file.save', (file) => {
            let node = this.vfTreeDataProvider.getNode(file.path);
            if (node) {
                node.fileType = file.fileType;
                node.contentMime = file.contentMime;
                node.delayTimeMin = parseInt(file.delayTimeMin, 10);
                node.delayTimeMax = parseInt(file.delayTimeMax, 10);
                node.content = file.content;
                this.vfTreeDataProvider.update();
            }
        });

        this.vfManagerPanel.on('open.file.dialog', () => {
            window.showOpenDialog({
                openLabel: 'Select',
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false
            }).then((value) => {
                if (value) {
                    let result = path.relative(workspace.rootPath, value[0].fsPath);
                    this.vfManagerPanel.CallWebviewHandler('open.file.dialog.result', result);
                }
            });
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

                let onreadfilerequest = (req: IncomingMessage, res: ServerResponse, hr) => {
                    this.onReadVFSRequest(req, res, hr);
                };

                this.liveServer.on('http.fs.request', onreadfilerequest);

                this.wsTreeDataProvider.start();
                let messageHandler = (ws, message) => { this.onClientMessage(ws, message); };
                this.liveServer.on('ws.client.message', messageHandler);

                let clientListUpdate = () => { this.NotifyWebview_ClientListUpdated(); };
                this.liveServer.on('ws.client.open', clientListUpdate);
                this.liveServer.on('ws.client.close', clientListUpdate);

                this.liveServer.once('close', () => {
                    this.wsTreeDataProvider.stop();
                    this.liveServer.removeListener('ws.client.message', messageHandler);
                    this.liveServer.removeListener('ws.client.open', clientListUpdate);
                    this.liveServer.removeListener('ws.client.close', clientListUpdate);
                    this.liveServer.removeListener('http.fs.request', onreadfilerequest);
                });
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

    public changeWorkspaceRoot() {
        setOrChangeWorkspace()
            .then(workspceName => {
                if (workspceName === undefined) return;
                window.showInformationMessage(`Success! '${workspceName}' workspace is now root of Live Server`);
                // If server is running, Turn off the server.
                if (this.IsServerRunning)
                    this.GoOffline();
            });
    }

    public showWSManagerPanel(clientId: string) {
        this.wsManagerPanel.Show();
        this.wsManagerPanel.setPanelClientId(clientId);
    }

    public showVFSManagerPanel(node: HVFNode) {
        if (node) {
            this.vfManagerPanel.setCurrentFile(node);
            this.vfManagerPanel.Show();
        }
    }
    private checkFileName(name?: string): boolean {
        if (!name)
            return false;
        name = name.trim();
        if (name.length <= 0)
            return false;
        if (name.includes(path.sep) || name.includes('?') || name.includes('*'))
            return false;
        return true;
    }
    private showInputFileNameBox(parent: HVFNode, title: string, callback: (value: string) => void) {
        let pick = window.createInputBox();
        pick.title = title;
        pick.onDidAccept(() => {
            if (this.checkFileName(pick.value)) {
                let name = pick.value.trim();
                if (!parent.has(name)) {
                    callback(name);
                    pick.hide();
                } else {
                    pick.validationMessage = 'The file or folder already exists.';
                }
            } else {
                pick.validationMessage = 'The file name is invalid.';
            }
        });
        pick.onDidHide(() => { pick.dispose(); });
        pick.show();
    }
    private resolveParentNode(parent: HVFNode): HVFNode {
        if (!parent) {
            parent = this.vfTreeView.selection[0];
            if (!parent)
                parent = this.vfTreeDataProvider.getNode(path.sep);
        }
        if (!parent.isFolder)
            parent = parent.parent;
        return parent;
    }
    public VFSNodeRemove(node: HVFNode) {
        if (!node) {
            node = this.vfTreeView.selection[0];
            if (!node)
                node = this.vfTreeDataProvider.getNode(path.sep);
        }
        let parent = node.parent;
        if (parent)
            parent.removeChild(node.label);
        this.vfTreeDataProvider.update();
    }
    public VFSNodeClear(parent: HVFNode) {
        parent = this.resolveParentNode(parent);
        parent.clear();
        this.vfTreeDataProvider.update();
    }
    public VFSDirectoryNew(parent: HVFNode) {
        parent = this.resolveParentNode(parent);
        this.showInputFileNameBox(parent, 'input name', (value) => {
            let node = this.vfTreeDataProvider.createFolderNode(value);
            parent.addNode(node);
            this.vfTreeDataProvider.update();
        });
    }

    public VFSFileNew(parent: HVFNode) {
        parent = this.resolveParentNode(parent);
        this.showInputFileNameBox(parent, 'input name', (value) => {
            let node = this.vfTreeDataProvider.createFileNode(value);
            parent.addNode(node);
            this.vfTreeDataProvider.update();
        });
    }

    public closeWebsocketClient(clientId?: string) {
        if (this.liveServer) {
            if (clientId) {
                this.liveServer.WSClients.forEach((ws) => {
                    if (ws.id === clientId) {
                        ws.close(0, 'user close');
                    }
                });
            } else {
                this.liveServer.WSClients.forEach((ws) => {
                    ws.close(1000, 'user close');
                });
            }
        }
    }

    public refreshWebsocketTree() {
        this.wsTreeDataProvider.refresh();
    }

    private readVFSRespond(node: HVFNode, req: IncomingMessage, res: ServerResponse) {
        res.writeHead(200, {
            'content-type': node.contentMime
        });
        if (node.fileType === 'content')
            res.write(node.content);
        else if (node.fileType === 'file') {
            let name = node.content;
            if (!path.isAbsolute(name))
                name = path.normalize(path.join(workspace.rootPath, name));
            res.write(readFileSync(name));
        } else if (node.fileType === 'script') {
            try {
                let fn = new Function('request', 'resonse', '"use strict";\r\n' + node.content);
                fn(req, res);
            } catch (ex) {
                if (!res.headersSent) {
                    res.writeHead(500, ex.message);
                    res.write(ex.toString());
                }
            }
        }
        res.end();
    }
    private onReadVFSRequest(req: IncomingMessage, res: ServerResponse, hr) {
        let url = Uri.parse(req.url);
        let urlpath = url.fsPath === path.sep ? path.join(url.fsPath, 'index.html') : url.fsPath;
        let node = this.vfTreeDataProvider.getNode(path.normalize(urlpath));
        if (node && (!node.isFolder)) {
            if (node.delayTimeMin !== 0 || node.delayTimeMax !== 0) {
                let dt = (node.delayTimeMax === node.delayTimeMin) ?
                    Math.abs(node.delayTimeMax)
                    :
                    Math.abs(node.delayTimeMin + (Math.random() * (node.delayTimeMax - node.delayTimeMin)));

                setTimeout(() => {
                    this.readVFSRespond(node, req, res);
                    hr.next();
                }, dt);
            } else {
                this.readVFSRespond(node, req, res);
                hr.next();
            }
            hr.handled = true;
        } else {
            hr.handled = false;
        }
    }

    private DecodeWSMessage(message: any, encoding: WSMessageEncoding): string | Buffer {
        if (!message)
            return message;
        if (encoding === WSMessageEncoding.Plaintext)
            return message;
        return new Buffer(message, 'base64');
    }

    private EncodeWSMessage(message: any, encoding: WSMessageEncoding): string | Buffer {
        if (!message)
            return message;
        if (encoding === WSMessageEncoding.Plaintext)
            return message;
        return message.toString('base64');
    }

    private NotifyWebview_ClientListUpdated() {
        let data = [];
        this.liveServer.WSClients.forEach((c) => { data.push(c.id); });
        this.wsManagerPanel.CallWebviewHandler('websocket.client.updated', data);
    }

    private sendMessageToClient(client: WebSocketConnection | string, encoding: string, message: any) {
        if (!this.liveServer)
            return;
        let data = this.DecodeWSMessage(message, WSMessageEncoding[encoding]);
        if (client) {
            if (typeof (client) === 'string')
                this.liveServer.WSClients.forEach((ws) => {
                    if (ws.id === client)
                        ws.send(data);
                });
            else
                client.send(data);
        } else {
            this.liveServer.WSClients.forEach((ws) => {
                ws.send(data);
            });
        }

        let msg = {
            sourceType: WSMessageSource.Server,
            sourceId: 'live-server',
            time: new Date(),
            encoding: WSMessageEncoding[encoding],
            message: message
        };
        this.pushWebSocketMessageHistory(msg);
        this.wsManagerPanel.CallWebviewHandler('websocket.message.added', msg);
    }

    private setAutoSendWSMessage(encoding: string, message: any) {
        if (encoding && message) {
            this.AutoSendWSMessage = {
                sourceType: WSMessageSource.Server,
                sourceId: 'live-server',
                time: new Date(),
                encoding: WSMessageEncoding[encoding],
                message: message
            };
        } else {
            this.AutoSendWSMessage = null;
        }
    }

    private setIntervalSendWSMessage(interval: number, encoding: string, message: any) {
        if (this.IntervalSendWSMessageTimer != null) {
            clearInterval(this.IntervalSendWSMessageTimer);
            this.IntervalSendWSMessageTimer = null;
        }
        if (interval > 0) {
            this.IntervalSendWSMessageTimer = setInterval(() => {
                this.sendMessageToClient(undefined, encoding, message);
            }, interval);
            this.SendWSMessageInterval = interval;
        }
    }

    private sendWSMessageHistorys(index: number, count: number) {
        let length = this.WebSocketMessageHistorys.length;
        index = length - index;
        if (index < 0)
            index = 0;
        if (index > length) {
            this.wsManagerPanel.CallWebviewHandler('websocket.message.history', [], length);
            return;
        }
        if (index - count < 0) {
            count = index;
        }

        if (count === 0) {
            this.wsManagerPanel.CallWebviewHandler('websocket.message.history', [], 0);
            return;
        }
        let historys = [];
        for (let i = index - count; i < index; ++i) {
            historys.push(this.WebSocketMessageHistorys[i]);
        }
        this.wsManagerPanel.CallWebviewHandler('websocket.message.history', historys, index - 1);
    }

    private clearWSMessageHistory() {
        this.WebSocketMessageHistorys = [];
        this.sendWSMessageHistorys(0, 0);
    }
    private pushWebSocketMessageHistory(msg: WSMessage) {
        if (this.WebSocketMessageHistorys.length >= Config.MaxWebsocketMessageHistory) {
            this.WebSocketMessageHistorys.shift();
        }
        this.WebSocketMessageHistorys.push(msg);
    }

    private onClientMessage(ws: WebSocketConnection, message: Buffer | string) {
        let encoding = Buffer.isBuffer(message) ? WSMessageEncoding.BinBuffer : WSMessageEncoding.Plaintext;
        let msg = {
            sourceType: WSMessageSource.Client,
            sourceId: ws.id,
            time: new Date(),
            encoding: encoding,
            message: this.EncodeWSMessage(message, encoding)
        };
        this.pushWebSocketMessageHistory(msg);
        this.wsManagerPanel.CallWebviewHandler('websocket.message.added', msg);

        if (this.AutoSendWSMessage) {
            let m = this.AutoSendWSMessage;
            this.sendMessageToClient(ws, WSMessageEncoding[m.encoding], m.message);
        }
    }

    private showWSMessageOptions(encoding: string, message: any) {
        let pick = window.createQuickPick<QuickPickItem>();
        let items = [
            {
                label: (this.AutoSendWSMessage ? '$(circle-slash) Disable auto-reply' : '$(check) Enable auto-reply'),
                description: (this.AutoSendWSMessage ? 'Disable Auto-reply when you receive a message' : 'Enable Auto-reply current content when you receive a message'),
                action: () => {
                    if (this.AutoSendWSMessage)
                        this.setAutoSendWSMessage(undefined, undefined);
                    else {
                        if ((!encoding) || (!message))
                            this.showPopUpMsg('Invaild message data, Please enter a valid message.', true);
                        else
                            this.setAutoSendWSMessage(encoding, message);
                    }
                },
            },
            {
                label: (this.IntervalSendWSMessageTimer ? '$(circle-slash) Disable Interval send' : '$(check) Enable Interval send'),
                description: (this.IntervalSendWSMessageTimer ? 'Disable Sending periodically based on time intervals' : 'Enable Sending current content periodically based on time intervals'),
                action: () => {
                    if (this.IntervalSendWSMessageTimer)
                        this.setIntervalSendWSMessage(0, undefined, undefined);
                    else {
                        if ((!encoding) || (!message))
                            this.showPopUpMsg('Invaild message data, Please enter a valid message.', true);
                        else {
                            let input = window.createInputBox();
                            input.value = this.SendWSMessageInterval.toString();
                            input.title = 'input interval time (ms)';
                            input.step = 0;
                            input.totalSteps = 0;
                            input.show();
                            input.onDidAccept(() => {
                                let v = parseInt(input.value, 10);
                                if (v <= 0 || v > 999999999)
                                    input.validationMessage = 'The interval time must be greater than 0 and less than 999999999';
                                else {
                                    this.setIntervalSendWSMessage(v, encoding, message);
                                    input.hide();
                                }
                            });
                            input.onDidHide(() => { input.dispose(); });
                        }
                    }
                }
            }
        ];
        pick.canSelectMany = false;
        pick.matchOnDescription = true;
        pick.items = items;
        pick.step = 0;
        pick.title = 'Message options';
        pick.totalSteps = 0;
        pick.show();
        pick.onDidAccept(() => {
            let item = pick.selectedItems[0] as any;
            item.action();
            pick.hide();
        });
        pick.onDidHide(() => { pick.dispose(); });
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

    private openBrowser(port: number, spath: string) {
        const host = Config.getLocalIp ? this.localIps : Config.getHost;
        const protocol = Config.getHttps.enable ? 'https' : 'http';

        let params: string[] = [];
        let advanceCustomBrowserCmd = Config.getAdvancedBrowserCmdline;
        if (spath.startsWith('\\') || spath.startsWith('/')) {
            spath = spath.substring(1, spath.length);
        }
        spath = spath.replace(/\\/gi, '/');

        let useBrowserPreview = Config.getUseBrowserPreview;
        if (useBrowserPreview) {
            let url = `${protocol}://${host}:${port}/${spath}`;
            let onSuccess = () => { };
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
            params[0] = `microsoft-edge:${protocol}://${host}:${port}/${spath}`;
        }

        try {
            opn(`${protocol}://${host}:${port}/${spath}`, { app: params || [''] });
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
