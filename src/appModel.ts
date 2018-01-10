'use strict';

import { window, workspace, WorkspaceFolder } from 'vscode';

import { LiveServerHelper } from './LiveServerHelper';
import { StatusbarUi } from './StatusbarUi';
import { Config } from './Config';
import { Helper, SUPPRORTED_EXT } from './Helper';


export class AppModel {

    private IsServerRunning: boolean;
    private IsStaging: boolean;
    private LiveServerInstance;
    private runningPort: number;

    constructor() {
        this.IsServerRunning = false;
        this.runningPort = null;

        Helper.HaveAnySupportedFile(() => {
            StatusbarUi.Init();
        });

    }

    public Golive(pathUri?: string) {

        if (!workspace.workspaceFolders) {
            Helper.showPopUpMsg(`Open a folder...`, true);
            return;
        }

        const workspaceFolders: WorkspaceFolder[] = workspace.workspaceFolders;
        const activeDocUrl = pathUri || Helper.getActiveDocUrl();
        let pathInfos = Helper.ExtractFilePath(workspaceFolders, activeDocUrl);

        if (this.IsServerRunning)
            return Helper.openBrowser(this.runningPort, Helper.getRelativeUrlToOpenInBrowser(pathUri));

        // if (pathInfos.HasVirtualRootError) {
        //     Helper.showPopUpMsg('Invaild Path in liveServer.settings.root settings. live Server will serve from workspace root', true);
        // }

        if (this.IsStaging) return;

        let params = Helper.generateParams(workspace.workspaceFolders.map(e => e.uri.fsPath), workspaceFolders, () => {
            this.tagMissedCallback();
        });

        LiveServerHelper.StartServer(params, (serverInstance) => {
            if (serverInstance && serverInstance.address) {
                this.LiveServerInstance = serverInstance;
                this.runningPort = serverInstance.address().port;
                this.ToggleStatusBar();
                Helper.showPopUpMsg(`Server is Started at port : ${this.runningPort}`);

                if (!Config.getNoBrowser)
                    Helper.openBrowser(this.runningPort, Helper.getRelativeUrlToOpenInBrowser(pathUri));
            }
            else {
                if (!serverInstance.errorMsg)
                    Helper.showPopUpMsg(`Error on port ${Config.getPort}. Please try to change the port through settings or report on GitHub.`, true);
                else
                    Helper.showPopUpMsg(`Something is went wrong! Please check into Developer Console or report on GitHub.`, true);
                this.IsServerRunning = true; // to revert status - cheat :p
                this.ToggleStatusBar(); // reverted
            }
        });

        this.IsStaging = true;
        StatusbarUi.Working('Starting...');
    }

    public GoOffline() {
        if (this.IsStaging) return;
        if (!this.IsServerRunning) {
            Helper.showPopUpMsg(`Server is not already running`);
            return;
        }
        LiveServerHelper.StopServer(this.LiveServerInstance, () => {
            Helper.showPopUpMsg('Server is now offline.');
            this.ToggleStatusBar();
            this.LiveServerInstance = null;
            this.runningPort = null;
        });
        this.IsStaging = true;

        StatusbarUi.Working('Disposing...');

    }

    private tagMissedCallback() {
        Helper.showPopUpMsg('Live Reload is not possible without body or head tag.', null, true);
    }

   
    private ToggleStatusBar() {
        this.IsStaging = false;
        if (!this.IsServerRunning) {
            StatusbarUi.Offline(this.runningPort || Config.getPort);
        }
        else {
            StatusbarUi.Live();
        }

        this.IsServerRunning = !this.IsServerRunning;
    }

    

    public dispose() {
        StatusbarUi.dispose();
    }
}


