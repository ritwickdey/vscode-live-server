'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './Config';


export class Helper {

    public static ExtractFilePath(workSpacePath: string, openedDocUri: string, virtualRoot: string) {

        let documentPath = path.dirname(openedDocUri);

        //if only a single file is opened, WorkSpacePath will be NULL
        let rootPath = workSpacePath ? workSpacePath : documentPath;

        virtualRoot = path.join(rootPath, virtualRoot);
        let HasVirtualRootError: boolean;

        if (fs.existsSync(virtualRoot)) {
            rootPath = virtualRoot;
            HasVirtualRootError = false;
        }
        else {
            HasVirtualRootError = true;
        }

        // let filePathFromRoot: string = Helper.relativeHtmlPathFromRoot(rootPath,openedDocUri);

        if (process.platform === 'win32') {
            if (!rootPath.endsWith('\\'))
                rootPath = rootPath + '\\';
        }
        else {
            if (!rootPath.endsWith('/'))
                rootPath = rootPath + '/';
        }

        return {
            HasVirtualRootError: HasVirtualRootError,
            rootPath: rootPath,
            WorkSpacePath: workSpacePath
        };
    }

    public static relativeHtmlPathFromRoot(rootPath: string, targetPath: string) {

        if (!Helper.IsHtmlFile(targetPath) || !targetPath.startsWith(rootPath)) {
            return null;
        }

        return targetPath.substring(rootPath.length, targetPath.length);
    }

    public static IsHtmlFile(fileUri: string): boolean {
        return fileUri.endsWith('.html') || fileUri.endsWith('.htm');
    }

    public static generateParams(rootPath: string, port: number, ignoreFilePaths: string[], workspacePath: string) {
        workspacePath = workspacePath || '';

        ignoreFilePaths.forEach((ignoredFilePath, index, thisArr) => {
            if (!ignoredFilePath.startsWith('/') || !ignoredFilePath.startsWith('\\')) {
                if (process.platform === 'win32') {
                    thisArr[index] = '\\' + ignoredFilePath;
                }
                else {
                    thisArr[index] = '/' + ignoredFilePath;
                }
            }
            thisArr[index] = workspacePath + thisArr[index];
        });


        return {
            port: port,
            host: '0.0.0.0',
            root: rootPath,
            file: null,
            open: false,
            ignore: ignoreFilePaths
        }
    }


}