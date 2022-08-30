import { Memento, extensions, window } from 'vscode';

export const SETUP_STRING = 'liveServer.setup.version';

export async function checkNewAnnouncement(memento: Memento) {

    const packageJSON = extensions.getExtension('ritwickdey.LiveServer').packageJSON;
    const announcement = packageJSON.announcement;

    if (!announcement && Object.keys(announcement).length === 0) return;

    const stateVersion = await memento.get(SETUP_STRING) || '0.0.0';
    const installedVersion = packageJSON.version;

    if (stateVersion !== installedVersion && installedVersion === announcement.onVersion) {
        await memento.update(SETUP_STRING, installedVersion);
        const showDetails = 'Show Details';
        const choice = await window.showInformationMessage(announcement.message, showDetails);
        if (choice === showDetails) {
            const url = announcement.url || 'https://github.com/ritwickdey/vscode-live-server';
            require('opn')(url);
        }

    }

}
