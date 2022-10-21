'use strict';

export class LiveServerHelper {

    static StartServer(params, callback) {
        setTimeout(() => {
            try {
                let ServerInstance = require('live-server').start(params);
                setTimeout(() => {

                    if (!ServerInstance._connectionKey) {
                        return callback({});
                    }

                    require('http-shutdown')(ServerInstance);
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
        require('live-server').shutdown();
        setTimeout(() => { callback(); }, 1000);
    }
}