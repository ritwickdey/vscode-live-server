import { workspace } from 'vscode';


export const workspaceResolver = () => {
    return new Promise<string>(resolve => {
        resolve(workspace.rootPath || '');
    });
};
