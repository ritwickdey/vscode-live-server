import { workspace, window } from 'vscode';


export const workspaceResolver = () => {
    return new Promise<string>(resolve => {
        const { workspaceFolders } = workspace;
        const workspaceNames = workspaceFolders.map(e => e.name);

        // If only one workspace.
        if (workspaceNames.length === 1) {
            return resolve(workspaceFolders[0].uri.fsPath);
        }

        window.showQuickPick(workspaceNames, {
            placeHolder: 'choose workspace for Live Server'
        }).then(workspaceName => {
            if (workspaceName) {
                const workspaceUri = workspaceFolders.find(e => e.name === workspaceName).uri.fsPath;
                resolve(workspaceUri);
            }
        });
    });
};
