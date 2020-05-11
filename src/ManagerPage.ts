import { window, ViewColumn, Uri, WebviewPanel } from 'vscode';
import * as path from 'path';
import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { HVFNode } from './LiveTreeDataProvider';


export abstract class ManagerPanel extends EventEmitter {
	private mPanel: WebviewPanel;
	private readonly mExtensionPath: string;
	constructor(extensionPath: string) {
		super();
		this.mExtensionPath = extensionPath;
	}
	protected get ExtensionPath(): string { return this.mExtensionPath; }
	protected get Panel(): WebviewPanel { return this.mPanel; }
	protected abstract get ViewType(): string;
	protected abstract get ViewTitle(): string;
	protected abstract get ResourcePath(): string;
	public Show() {
		const column = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined;
		if (this.mPanel) {
			this.mPanel.reveal(column);
			return;
		}

		this.mPanel = window.createWebviewPanel(
			this.ViewType,
			this.ViewTitle,
			column || ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [Uri.file(path.join(this.mExtensionPath, 'manager.pages'))]
			}
		);

		this.mPanel.iconPath = Uri.file(path.join(this.mExtensionPath, 'images/icon.png'));

		let onReceiveMessage = (message) => {
			if (message.handler)
				this.emit(message.handler, ...message.args);
		};

		this.mPanel.onDidDispose(() => {
			this.dispose();
		});
		this.mPanel.onDidChangeViewState(() => {
			if (this.mPanel.visible) {
				this._reload();
			}
		});

		this.mPanel.webview.onDidReceiveMessage(onReceiveMessage);
		this._reload();
	}

	public CallWebviewHandler(name: string, ...args: any[]): boolean {
		if (this.mPanel && this.mPanel.visible) {
			let msg = {
				handler: name,
				args: args
			};
			this.mPanel.webview.postMessage(msg);
			return true;
		}
		return false;
	}

	public dispose() {
		this.mPanel.dispose();
		this.mPanel = undefined;
	}

	private _reload() {
		const webview = this.mPanel.webview;
		webview.html = this.getWebviewContent();
	}

	private getWebviewContent(): string {
		const templatePath = this.ResourcePath;
		const resourcePath = path.join(this.mExtensionPath, templatePath);
		return readFileSync(resourcePath, 'utf8');
	}
}

export class WebsocketManagerPanel extends ManagerPanel {
	public static readonly viewType = 'LiveServerWSManagerPanel';
	private mCurrentClientId: string;
	constructor(extensionPath: string) {
		super(extensionPath);
		this.addListener('page.ready', () => {
			if (this.mCurrentClientId)
				this.CallWebviewHandler('websocket.client.set', this.mCurrentClientId);
		});
	}

	protected get ViewType(): string {
		return WebsocketManagerPanel.viewType;
	}
	protected get ViewTitle(): string {
		return 'WebSocket Message';
	}
	protected get ResourcePath(): string {
		return 'manager.pages/websocket.panel.html';
	}

	public setPanelClientId(clientId: string) {
		this.mCurrentClientId = clientId;
		this.CallWebviewHandler('websocket.client.set', this.mCurrentClientId);
	}
}

export class VFSManagerPanel extends ManagerPanel {
	public static readonly viewType = 'LiveServerVFSManagerPanel';
	private mCurrentFile: {
		path: string,
		isFolder: boolean,
		fileType: string,
		contentMime: string,
		delayTimeMax: number,
		delayTimeMin: number,
		content: string
	};
	constructor(extensionPath: string) {
		super(extensionPath);
		this.addListener('page.ready', () => {
			if (this.mCurrentFile) {
				this.CallWebviewHandler('vitrual.file.update', this.mCurrentFile);
				this.mCurrentFile = null;
			}
		});
	}

	protected get ViewType(): string {
		return VFSManagerPanel.viewType;
	}
	protected get ViewTitle(): string {
		return 'VFS file editor';
	}
	protected get ResourcePath(): string {
		return 'manager.pages/vfs.panel.html';
	}

	public setCurrentFile(node: HVFNode) {
		this.mCurrentFile = {
			path: node.path,
			isFolder: node.isFolder,
			fileType: node.fileType,
			contentMime: node.contentMime,
			delayTimeMax: node.delayTimeMax,
			delayTimeMin: node.delayTimeMin,
			content: node.content
		};
		if (this.CallWebviewHandler('vitrual.file.update', this.mCurrentFile)) {
			this.mCurrentFile = null;
		}
	}
}
