'use strict';
const liveServer = require('live-server');
const httpShutdown = require('http-shutdown');

export class LiveServerHelper {

    static StartServer(params, callback) {
        setTimeout(() => {
            try {
                let ServerInstance = liveServer.start(params);
                setTimeout(() => {

                    if (!ServerInstance._connectionKey) {
                        return callback({});
                    }

                    httpShutdown(ServerInstance);
                    return callback(ServerInstance);

                }, 1000);
            } catch (err) {
                console.error(err);
                callback({
                    errorMsg: err
                });
            }

        }, 0);

    }

    static StopServer(LiveServerInstance, callback) {
        LiveServerInstance.shutdown(() => {
            // callback(); /*only Working first time, Unknown Bug*/
        });
        LiveServerInstance.close();
        liveServer.shutdown();
        setTimeout(() => { callback(); }, 1000);
    }
}