import { workspace, window } from 'vscode';
import { Config } from './Config';


export const workspaceResolver = () => {
    return new Promise<string>(resolve => {
        const { workspaceFolders } = workspace;
        const workspaceNames = workspaceFolders.map(e => e.name);

        // If only one workspace.
        if (workspaceNames.length === 1) {
            return resolve(workspaceFolders[0].uri.fsPath);
        }

        // If workspace already set by User
        if (Config.getMutiRootWorkspaceName) {
            // A small test that the WorkspaceName is valid
            const targetWorkspace = workspaceFolders.find(e => e.name === Config.getMutiRootWorkspaceName);
            if (targetWorkspace)
                return resolve(targetWorkspace.uri.fsPath);

            // reset whatever user is set;
            Config.setMutiRootWorkspaceName(null);
        }

        // Show a quick picker
        window.showQuickPick(workspaceNames, {
            placeHolder: 'choose workspace for Live Server'
        }).then(workspaceName => {
            if (workspaceName) {
                const workspaceUri = workspaceFolders.find(e => e.name === workspaceName).uri.fsPath;
                Config.setMutiRootWorkspaceName(workspaceName)
                    .then(() => resolve(workspaceUri));
            }
        });
    });
};
