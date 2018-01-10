'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { Config } from './Config';
import { WorkspaceFolder, window, workspace } from 'vscode';

export const SUPPRORTED_EXT: string[] = [
    '.html', '.htm', '.svg'
];

export class Helper {


    public static ExtractFilePath(workSpaceFolders: WorkspaceFolder[], openedDocUri: string) {

        // let documentPath = path.dirname(activeDocUrl);

        // WorkSpacePath will be NULL if only a single file is opened.
        let rootPath = workSpaceFolders.map(e => e.uri.fsPath);

        /*
        *
        * TODO : Config.roots
        *
        */

        // virtualRoot = path.join(rootPath, virtualRoot);

        // let HasVirtualRootError = !fs.existsSync(virtualRoot);
        // if (!HasVirtualRootError) {
        //     rootPath = virtualRoot;
        // }

        // if (process.platform === 'win32') {
        //     if (!rootPath.endsWith('\\')) rootPath = rootPath + '\\';
        // }
        // else {
        //     if (!rootPath.endsWith('/')) rootPath = rootPath + '/';
        // }

        return {
            // HasVirtualRootError: HasVirtualRootError,
            rootPath: rootPath
        };
    }

    /**
     * This function return the remaining path from root to target.
     * e.g. : root is `c:\user\rootfolder\` and target is `c:\user\rootfolder\subfolder\index.html`
     * then this function will return `subfolder\index.html` as html is a supported otherwise it will return null.
     *
     * @param rootPaths
     * @param targetPath
     */
    public static getSubPathIfSupported(rootPaths: string[], targetPath: string) {

        if(!targetPath) return null;
        
        const selectedRootPath = rootPaths.find(e => targetPath.startsWith(e));
        
        if (!selectedRootPath || !Helper.IsSupportedFile(targetPath)) {
            return null;
        }

        return {
            workspaceIndex: rootPaths.indexOf(selectedRootPath),
            relativePath: targetPath.substring(selectedRootPath.length, targetPath.length)
        };
    }

    /**
     * It returns true if file is supported. input can be in full file path or just filename with extension name.
     * @param file: can be path/subpath/file.ts or file.ts
     */
    public static IsSupportedFile(file: string): boolean {
        let ext = path.extname(file) || (file.startsWith('.') ? file : `.${file}`);
        return SUPPRORTED_EXT.indexOf(ext.toLowerCase()) > -1;
    }


    /**
     *
     * @param rootPaths
     * @param workspacePath
     * @param onTagMissedCallback
     */
    public static generateParams(
        rootPaths: string[],
        workspacePath: WorkspaceFolder[],
        onTagMissedCallback?: MethodDecorator) {

        workspacePath = workspacePath || null;
        const port = Config.getPort;
        const ignorePathGlob = Config.getIgnoreFiles || [];
        let ignoreFiles = [];

        // ignorePathGlob.forEach((ignoredPath, index) => {
        //     if (!ignoredPath.startsWith('/') || !ignoredPath.startsWith('\\')) {
        //         ignoreFiles[index] = path.join(workspacePath, ignoredPath);
        //     }
        // });
        const proxy = Helper.getProxySetup();
        const https = Helper.getHttpsSetup();

        const serveMaps: number[] = [];
        rootPaths.forEach((e, i) => serveMaps.push(i + 1));

        return {
            port: port,
            host: '0.0.0.0',
            roots: rootPaths,
            file: null,
            open: false,
            https: https,
            ignore: ignoreFiles,
            disableGlobbing: true,
            proxy: proxy,
            useBrowserExtension: Config.getUseWebExt,
            onTagMissedCallback: onTagMissedCallback,
            serveMaps: serveMaps.length <= 1 ? [] : serveMaps //if workspace contains 1 root, then use `/` mapping 
        };
    }

    static getHttpsSetup() {
        const httpsConfig = Config.getHttps;
        let https = null;
        if (httpsConfig.enable === true) {
            let cert = fs.readFileSync(httpsConfig.cert, 'utf8');
            let key = fs.readFileSync(httpsConfig.key, 'utf8');
            https = {
                cert: cert,
                key: key,
                passphrase: httpsConfig.passphrase
            };
        }

        return https;
    }

    static getProxySetup() {
        const proxySetup = Config.getProxy;
        let proxy = [[]];
        if (proxySetup.enable === true) {
            proxy[0].push(proxySetup.baseUri, proxySetup.proxyUri);
        }
        else {
            proxy = null; // required to change the type [[]] to black array [].
        }

        return proxy;
    }

    static getActiveDocUrl(): string {
        return window.activeTextEditor ? window.activeTextEditor.document.fileName : null;
    }

    static getWorkspacesUrls() {
        if (!workspace.workspaceFolders) return null;

        return workspace.workspaceFolders
            .map(e => e.uri.fsPath);
    }

    static getRelativeUrlToOpenInBrowser(activeDocUrl?: string) {
        activeDocUrl = activeDocUrl || Helper.getActiveDocUrl();

        const workspaceUrls = Helper.getWorkspacesUrls();
        const relativePathObj = Helper.getSubPathIfSupported(workspaceUrls, activeDocUrl);
        if (!relativePathObj) return null;
        if (workspaceUrls.length === 1)
            return relativePathObj.relativePath;

        return (relativePathObj.workspaceIndex + 1) + relativePathObj.relativePath;
    }


}