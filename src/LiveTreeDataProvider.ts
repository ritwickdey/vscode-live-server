import { TreeDataProvider, Event, TreeItem, ProviderResult, TreeItemCollapsibleState, ThemeIcon, EventEmitter, workspace } from 'vscode';
import { IAppModel } from './IAppModel';
import { WebSocketConnection } from './ILiveServer';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

export class HVFNode extends TreeItem {
    private mChildNodes: Map<string, HVFNode>;
    private mParent: HVFNode;
    public readonly isFolder: boolean;
    public fileType: string;
    public contentMime: string;
    public delayTimeMin: number;
    public delayTimeMax: number;
    public content: string;
    constructor(name: string, isFolder: boolean, icon: string) {
        super(name, isFolder ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
        this.isFolder = isFolder;
        this.iconPath = icon;
        if (!isFolder) {
            this.command = {
                command: 'extension.liveServer.openVFSManagerPage',
                arguments: [this],
                title: 'Open VFS Editor'
            };
        }
        this.mChildNodes = new Map<string, HVFNode>();
        this.mParent = null;
        this.fileType = 'content';
        this.contentMime = '';
        this.delayTimeMin = 0;
        this.delayTimeMax = 0;
        this.content = '';
    }

    public get ChildNodes(): Array<HVFNode> {
        let x = new Array<HVFNode>();
        this.mChildNodes.forEach((i) => { x.push(i); });
        return x.sort((a, b) => {
            if (a.isFolder && (!b.isFolder))
                return -1;
            else if ((!a.isFolder) && (b.isFolder))
                return 1;
            return a.label.localeCompare(b.label);
        });
    }

    public get parent(): HVFNode {
        return this.mParent;
    }

    public get path(): string {
        let p: HVFNode = this;
        let r = '';
        while (p.parent) {
            r = path.join(p.label, r);
            p = p.parent;
        }
        return path.join(path.sep, r);
    }

    public has(name: string): boolean {
        return this.mChildNodes.has(name);
    }

    public getNode(name: string): HVFNode {
        return this.mChildNodes.get(name);
    }

    public addNode(node: HVFNode): HVFNode {
        this.mChildNodes.set(node.label, node);
        node.mParent = this;
        return node;
    }
    public clear() {
        this.mChildNodes.clear();
    }
    public removeChild(name: string): boolean {
        return this.mChildNodes.delete(name);
    }
}

export class WSCNode extends TreeItem {
    public readonly connection: WebSocketConnection;
    constructor(c: WebSocketConnection) {
        super(c.id, TreeItemCollapsibleState.None);
        this.id = c.id;
        this.connection = c;
        this.iconPath = new ThemeIcon('comment');
        this.command = {
            command: 'extension.liveServer.openWSManagerPage',
            arguments: [this.connection],
            title: 'Open Websocket Manager'
        };
    }
}

export class HTVFTreeDataProvider implements TreeDataProvider<HVFNode> {
    private mVFSRoot: HVFNode;
    private mOnDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    private mIcons: Array<string>;

    public readonly onDidChangeTreeData: Event<any> = this.mOnDidChangeTreeData.event;
    constructor(icons: Array<string>) {
        this.mVFSRoot = new HVFNode('root', true, icons[0]);
        this.mIcons = icons;
        this.loadVFS();
    }
    protected get VFSDataFile(): string {
        return path.join(workspace.rootPath, '.vscode', 'liveserver.vfs.json');
    }
    public getTreeItem(element: HVFNode): TreeItem | Thenable<TreeItem> {
        return element;
    }
    public getChildren(element?: HVFNode): ProviderResult<HVFNode[]> {
        if (element) {
            return element.ChildNodes;
        }
        return this.mVFSRoot.ChildNodes;
    }
    public getNode(pathName: string): HVFNode {
        while (pathName.startsWith(path.sep))
            pathName = pathName.substr(1);
        let names = pathName.split(path.sep).filter((x) => x.trim().length > 0);
        let dir = this.mVFSRoot;
        let i = 0;
        let n = names[i];
        while (dir && i < names.length) {
            dir = dir.getNode(n);
            n = names[++i];
        }
        return dir;
    }
    public update() {
        this.saveVFS();
        this.mOnDidChangeTreeData.fire();
    }

    public createFolderNode(name: string) {
        let node = new HVFNode(name, true, this.mIcons[0]);
        return node;
    }

    public createFileNode(name: string) {
        let node = new HVFNode(name, false, this.mIcons[1]);
        return node;
    }

    private loadVFS() {
        try {
            let data = JSON.parse(readFileSync(this.VFSDataFile, 'utf8')) as Array<any>;
            this.loadChildNodes(data, this.mVFSRoot);
        } catch (e) {
        }
    }
    private loadChildNodes(datas: Array<any>, node: HVFNode) {
        datas.forEach((d) => {
            if (d.name) {
                if (d.childs) {
                    let childs = d.childs as Array<any>;
                    let newNode = node.addNode(this.createFolderNode(d.name));
                    this.loadChildNodes(childs, newNode);
                } else {
                    let newNode = node.addNode(this.createFileNode(d.name));
                    newNode.fileType = d.fileType;
                    newNode.contentMime = d.contentMime;
                    newNode.delayTimeMin = d.delayTimeMin;
                    newNode.delayTimeMax = d.delayTimeMax;
                    newNode.content = d.content;
                }
            }
        });
    }

    private saveVFS() {
        try {
            let datas = [];
            this.mVFSRoot.ChildNodes.forEach((n) => { this.saveChildNodes(n, datas); });
            writeFileSync(this.VFSDataFile, JSON.stringify(datas, undefined, 4), 'utf8');
        } catch (e) {
        }
    }

    private saveChildNodes(node: HVFNode, datas: Array<any>) {
        if (node.isFolder) {
            let childs = [];
            node.ChildNodes.forEach((n) => {
                this.saveChildNodes(n, childs);
            });
            datas.push({
                name: node.label,
                childs: childs
            });
        } else {
            datas.push({
                name: node.label,
                fileType: node.fileType,
                contentMime: node.contentMime,
                delayTimeMin: node.delayTimeMin,
                delayTimeMax: node.delayTimeMax,
                content: node.content,
            });
        }
    }
}

export class WSCTreeDataProvider implements TreeDataProvider<WSCNode> {
    private mAppModel: IAppModel;
    private mOnDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
    public readonly onDidChangeTreeData: Event<any> = this.mOnDidChangeTreeData.event;
    constructor(appmodel: IAppModel) {
        this.mAppModel = appmodel;
    }
    public getTreeItem(element: WSCNode): TreeItem | Thenable<TreeItem> {
        return element;
    }
    public getChildren(element?: WSCNode): ProviderResult<WSCNode[]> {
        if (element || (!this.mAppModel.liveServer)) {
            return [];
        }
        let result = new Array<WSCNode>();
        this.mAppModel.liveServer.WSClients.forEach((c) => {
            result.push(new WSCNode(c));
        });
        return result;
    }
    public start(): void {
        if (this.mAppModel.liveServer) {
            this.mAppModel.liveServer.on('ws.client.open', (wsc) => {
                this.mOnDidChangeTreeData.fire();
            });
            this.mAppModel.liveServer.on('ws.client.close', (wsc) => {
                this.mOnDidChangeTreeData.fire();
            });
        }
    }
    public stop(): void {
        if (this.mAppModel.liveServer) {
            this.mAppModel.liveServer.removeAllListeners('ws.client.open');
            this.mAppModel.liveServer.removeAllListeners('ws.client.close');
        }
    }
    public refresh() {
        this.mOnDidChangeTreeData.fire();
    }
}
