'use strict';

import * as vscode from 'vscode';
import * as vsls from 'vsls/vscode';
import { IAppModel, GoLiveEvent, GoOfflineEvent } from './IAppModel';

/**
 * Manages state of a live server shared via VS Live Share.
 * Caches the live server path and starts/stops sharing in response to Live Share session events.
 */
export class LiveShareHelper implements vscode.Disposable {
    private liveshare: vsls.LiveShare | undefined;
    private activeHostSession: vsls.Session | undefined;
    private livePathUri: string;

    private deferredWork: Promise<void>;
    private sharedServer: vscode.Disposable;

    constructor(private readonly appModel: IAppModel) {
        this.appModel.onDidGoLive(async (e: GoLiveEvent) => {
            // cache the current live server browse url
            this.livePathUri = e.pathUri;
            await this.shareLiveServer();
        });
        this.appModel.onDidGoOffline((e: GoOfflineEvent) => {
            // reset the live server cached path
            this.livePathUri = null;
            if (this.activeHostSession && this.sharedServer) {
                // will un-share the server
                this.sharedServer.dispose();
                this.sharedServer = null;
            }
        });
        this.deferredWork = vsls.getApi().then(api => {
            if (api) { // if Live Share is available (installed)
                this.ensureInitialized(api);
            }
        });
    }

    async dispose() {
        await this.deferredWork;
    }

    private ensureInitialized(api: vsls.LiveShare) {
        this.liveshare = api;
        if (this.liveshare.session && this.liveshare.session.role === vsls.Role.Host) {
            this.activeHostSession = this.liveshare.session;
        }
        this.liveshare.onDidChangeSession(async (e: vsls.SessionChangeEvent) => {
            if (e.session.role === vsls.Role.Host) {
                // active sharing collaboration session
                this.activeHostSession = e.session;
                await this.shareLiveServer();
            } else {
                // any other session state, including joined as a guest
                this.activeHostSession = null;
            }
        });
    }

    private async shareLiveServer() {
        if (this.activeHostSession && this.livePathUri) {
            // only share the server when we're live and VS Live Share session is active
            this.sharedServer = await this.liveshare.shareServer({
                port: this.appModel.runningPort,
                displayName: 'Live Server',
                browseUrl: `http://localhost:${this.appModel.runningPort}/${this.livePathUri.replace(/\\/gi, '/')}`
            });
        }
    }
}