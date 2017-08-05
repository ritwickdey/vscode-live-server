'use strict';

import * as vscode from 'vscode';

export class Config {

    private static getSettings<T>(val: string): T {
        return vscode.workspace
            .getConfiguration('liveServer.settings')
            .get(val) as T;
    }

    public static get getPort(): number {
        return Config.getSettings<number>('port');
    }

    public static get getRoot(): string {
        return Config.getSettings<string>('root');
    }

    public static get getNoBrowser(): boolean {
        return Config.getSettings<boolean>('NoBrowser');
    }

    public static get getAdvancedBrowserCmdline(): string {
        return Config.getSettings<string>('AdvanceCustomBrowserCmdLine');
    }

    public static get getChromeDebuggingAttachment(): boolean {
        return Config.getSettings<boolean>('ChromeDebuggingAttachment');
    }

    public static get getCustomBrowser(): string {
        return Config.getSettings<string>('CustomBrowser');
    }

    public static get getIgnoreFiles(): string[] {
        return Config.getSettings<string[]>('ignoreFiles');
    }
}