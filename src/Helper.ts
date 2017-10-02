'use strict';

import * as fs from 'fs';
import * as path from 'path';

export const SUPPRORTED_EXT: string[] = [
    '.html', '.htm', '.svg'
];

export class Helper {


    public static ExtractFilePath(workSpacePath: string, openedDocUri: string, virtualRoot: string) {

        let documentPath = path.dirname(openedDocUri);

        // WorkSpacePath will be NULL if only a single file is opened.
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

    /**
     * This function return the remaining path from root to target.
     * e.g. : root is `c:\user\rootfolder\` and target is `c:\user\rootfolder\subfolder\index.html`
     * then this function will return `subfolder\index.html` as html is a supported otherwise it will return null.
     *
     * @param rootPath
     * @param targetPath
     */
    public static getSubPathIfSupported(rootPath: string, targetPath: string) {

        if (!Helper.IsSupportedFile(targetPath) || !targetPath.startsWith(rootPath)) {
            return null;
        }

        return targetPath.substring(rootPath.length, targetPath.length);
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
     * @param rootPath
     * @param port
     * @param ignorePathGlob
     * @param workspacePath
     * @param addtionalHTMLtags
     * @param onTagMissedCallback
     */
    public static generateParams(rootPath: string, port: number, ignorePathGlob: string[], workspacePath: string, addtionalHTMLtags?: string[], onTagMissedCallback?: MethodDecorator) {
        workspacePath = workspacePath || '';
        ignorePathGlob = ignorePathGlob || [];
        let ignoreFiles = [];

        ignorePathGlob.forEach((ignoredPath, index) => {
            if (!ignoredPath.startsWith('/') || !ignoredPath.startsWith('\\')) {
                if (process.platform === 'win32') {
                    ignoreFiles[index] = workspacePath + '\\' + ignoredPath;
                }
                else {
                    ignoreFiles[index] = workspacePath + '/' + ignoredPath;
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
            disableGlobbing: true,
            addtionalHTMLtags: addtionalHTMLtags,
            onTagMissedCallback: onTagMissedCallback
        };
    }


}
