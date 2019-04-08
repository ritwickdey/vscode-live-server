'use strict';

import { workspace } from 'vscode';

export interface IProxy {
    enable: boolean;
    baseUri: string;
    proxyUri: string;
}

export interface IHttps {
    enable: boolean;
    cert: string;
    key: string;
    passphrase: string;
}

export class Config {

    public static get configuration() {
        return workspace.getConfiguration('liveServer.settings');
    }

    private static getSettings<T>(val: string): T {
        return Config.configuration.get(val) as T;
    }

    private static setSettings(key: string, val: number, isGlobal: boolean = false): Thenable<void> {
        return Config.configuration.update(key, val, isGlobal);
    }

    public static get getHost(): string {
        return Config.getSettings<string>('host');
    }

    public static get getLocalIp(): string {
        return Config.getSettings<string>('useLocalIp');
    }

    public static get getPort(): number {
        return Config.getSettings<number>('port');
    }

    public static setPort(port: number): Thenable<void> {
        return Config.setSettings('port', port);
    }

    public static get getRoot(): string {
        return Config.getSettings<string>('root');
    }

    public static get getNoBrowser(): boolean {
        return Config.getSettings<boolean>('NoBrowser');
    }

    public static get getUseBrowserPreview(): boolean {
        return Config.getSettings<boolean>('useBrowserPreview');
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

    public static get getDonotShowInfoMsg(): boolean {
        return Config.getSettings<boolean>('donotShowInfoMsg');
    }

    public static setDonotShowInfoMsg(val: boolean, isGlobal: boolean = false) {
        Config.configuration.update('donotShowInfoMsg', val, isGlobal);
    }

    public static get getDonotVerifyTags(): boolean {
        return Config.getSettings<boolean>('donotVerifyTags');
    }

    public static setDonotVerifyTags(val: boolean, isGlobal: boolean = false) {
        Config.configuration.update('donotVerifyTags', val, isGlobal);
    }

    public static get getUseWebExt(): boolean {
        return Config.getSettings<boolean>('useWebExt') || false;
    }

    public static get getProxy(): IProxy {
        return Config.getSettings<IProxy>('proxy');
    }

    public static get getHttps(): IHttps {
        return Config.getSettings<IHttps>('https') || {} as IHttps;
    }

    public static get getWait(): number {
        return Config.getSettings<number>('wait');
    }

    public static get getfullReload(): boolean {
        return Config.getSettings<boolean>('fullReload');
    }

    public static get getMount(): Array<Array<string>> {
        return Config.getSettings<Array<Array<string>>>('mount');
    }

    public static get getShowOnStatusbar(): boolean {
        return Config.getSettings<boolean>('showOnStatusbar') || false;
    }

    public static get getFile(): string {
        return Config.getSettings<string>('file');
    }

    public static get getMutiRootWorkspaceName(): string {
        return Config.getSettings<string>('multiRootWorkspaceName');
    }

    public static setMutiRootWorkspaceName(val: string) {
       return Config.configuration.update('multiRootWorkspaceName', val, false);
    }
}
