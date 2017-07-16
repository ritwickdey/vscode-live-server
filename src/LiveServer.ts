'use strict';
import * as liveServer from 'live-server';
import * as httpShutdown from 'http-shutdown';

export class LiveServerClass {
     
    static StartServer(params, callback) {
        setTimeout(() => {
            let ServerInstance = liveServer.start(params);
            setTimeout(() => {

                if (ServerInstance._connectionKey == undefined || ServerInstance._connectionKey == null) {
                    callback(null);
                }

                httpShutdown(ServerInstance)
                callback(ServerInstance);

            }, 1000);

        }, 0);

    }

    static StopServer(LiveServerInstance, callback) {
        LiveServerInstance.shutdown(() => {
           // callback(); /*only Working first time, Unknown Bug*/
        });
        LiveServerInstance.close();
        liveServer.shutdown();
        setTimeout(()=>{callback()},1000);
    }
}