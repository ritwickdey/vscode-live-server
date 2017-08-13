'use strict';
import * as liveServer from 'live-server';
import * as httpShutdown from 'http-shutdown';

export class LiveServerHelper {

    static StartServer(params, callback) {
        setTimeout(() => {
            try {
                let ServerInstance = liveServer.start(params);
                setTimeout(() => {

                    if (ServerInstance._connectionKey == undefined || ServerInstance._connectionKey == null) {
                        return callback(null);
                    }

                    httpShutdown(ServerInstance)
                    return callback(ServerInstance);

                }, 1000);
            } catch (err) {
                callback(null);
            }

        }, 0);

    }

    static StopServer(LiveServerInstance, callback) {
        LiveServerInstance.shutdown(() => {
            // callback(); /*only Working first time, Unknown Bug*/
        });
        LiveServerInstance.close();
        liveServer.shutdown();
        setTimeout(() => { callback() }, 1000);
    }
}