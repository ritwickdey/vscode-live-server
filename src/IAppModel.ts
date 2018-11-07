'use strict';

import { Event } from 'vscode';

export interface GoLiveEvent {
    readonly runningPort: number;
    readonly pathUri?: string;
}

export interface GoOfflineEvent {
    readonly runningPort: number;
}

export interface IAppModel {
    readonly runningPort: number;
    readonly onDidGoLive: Event<GoLiveEvent>;
    readonly onDidGoOffline: Event<GoOfflineEvent>;
}