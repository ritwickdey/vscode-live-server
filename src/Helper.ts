'use strict';

import * as fs from 'fs';
import * as path from 'path';

export class Helper {

    public static ExtractFilePath(workSpacePath: string, openedDocUri: string, virtualRoot: string) {

        let documentPath = path.dirname(openedDocUri);
        
        //WorkSpacePath will be NULL if only a single file is opened.
        let rootPath = workSpacePath ? workSpacePath : documentPath;
        
        virtualRoot = path.join(rootPath, virtualRoot);
        
        let HasVirtualRootError = !fs.existsSync(virtualRoot);
        if (!HasVirtualRootError) {
            rootPath = virtualRoot;
        }
        
        if (process.platform === 'win32') {
            if (!rootPath.endsWith('\\')) rootPath = rootPath + '\\';
        }
        else {
            if (!rootPath.endsWith('/')) rootPath = rootPath + '/';
        }

        return {
            HasVirtualRootError: HasVirtualRootError,
            rootPath: rootPath
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
        ignoreFilePaths = ignoreFilePaths || [];
        let ignoreFiles = [];

        ignoreFilePaths.forEach((ignoredFilePath, index) => {
            if (!ignoredFilePath.startsWith('/') || !ignoredFilePath.startsWith('\\')) {
                if (process.platform === 'win32') {
                    ignoreFiles[index] = workspacePath + '\\' + ignoredFilePath;
                }
                else {
                    ignoreFiles[index] = workspacePath + '/' + ignoredFilePath;
                }
            }
        });


        return {
            port: port,
            host: '0.0.0.0',
            root: rootPath,
            file: null,
            open: false,
            ignore: ignoreFiles,
            disableGlobbing : true
        }
    }


}