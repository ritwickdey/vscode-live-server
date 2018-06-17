import { workspace, window } from 'vscode';
import { Config } from './Config';

export function setOrChangeWorkspace() {
    const { workspaceFolders } = workspace;
    const workspaceNames = workspaceFolders.map(e => e.name);

    return window.showQuickPick(workspaceNames, {
        placeHolder: 'choose workspace for Live Server',
        ignoreFocusOut: true
    }).then(workspaceName => {
        if (workspaceName) {
            return Config.setMutiRootWorkspaceName(workspaceName).then(() => workspaceName);
        }
    });
}


export function workspaceResolver(fileUri?: string) {
    return new Promise<string>(resolve => {
        const { workspaceFolders } = workspace;
        const workspaceNames = workspaceFolders.map(e => e.name);

        // If only one workspace. No need to check anything.
        if (workspaceNames.length === 1) {
            return resolve(workspaceFolders[0].uri.fsPath);
        }

        // if fileUri is set. Means, user tried to open server by right clicking to a HTML file.
        if (fileUri) {
            const selectedWorkspace = workspaceFolders.find(ws => fileUri.startsWith(ws.uri.fsPath));
            if (selectedWorkspace) {
                return Config.setMutiRootWorkspaceName(selectedWorkspace.name)
                    .then(() => resolve(selectedWorkspace.uri.fsPath));
            }
        }

        // If workspace already set by User
        if (Config.getMutiRootWorkspaceName) {
            // A small test that the WorkspaceName (set by user) is valid
            const targetWorkspace = workspaceFolders.find(e => e.name === Config.getMutiRootWorkspaceName);
            if (targetWorkspace)
                return resolve(targetWorkspace.uri.fsPath);

            // reset whatever user is set.
            Config.setMutiRootWorkspaceName(null);
        }

        // Show a quick picker
        setOrChangeWorkspace()
            .then(workspaceName => {
                const workspaceUri = workspaceFolders.find(e => e.name === workspaceName).uri.fsPath;
                return resolve(workspaceUri);
            });
    });
}
