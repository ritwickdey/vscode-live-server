'use strict';

import { Event, QuickPickItem } from 'vscode';
import { ILiveServer } from './ILiveServer';

export interface GoLiveEvent {
    readonly runningPort: number;
    readonly pathUri?: string;
}

export interface GoOfflineEvent {
    readonly runningPort: number;
}

export enum WSMessageSource {
    Server = 0,
    Client = 1
}

export enum WSMessageEncoding {
    Plaintext = 0,
    BinBuffer = 1
}

export interface WSMessage {
    sourceType: WSMessageSource;
    sourceId: string;
    time: Date;
    encoding: WSMessageEncoding;
    message: Buffer | string;
}

export interface IAppModel {
    readonly liveServer: ILiveServer;
    readonly runningPort: number;
    readonly onDidGoLive: Event<GoLiveEvent>;
    readonly onDidGoOffline: Event<GoOfflineEvent>;
}
