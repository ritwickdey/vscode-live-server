'use strict';

export class LiveServerHelper {
  static async StartServer(params, callback) {
    try {
      // the callback passed to require('live-server').start() resolves to the
      // server object when the server is in the ready state.
      const ServerInstance = await new Promise<any>((resolve) => {
        const server = require('live-server').start(params, () => resolve(server));
      });

      if (!ServerInstance._connectionKey) {
        await callback({});
      }
      require('http-shutdown')(ServerInstance);
      await callback(ServerInstance);
    } catch (err) {
      console.error(err);
      await callback({
          errorMsg: err
      });
    }
  }

  static async StopServer(LiveServerInstance, callback) {
    LiveServerInstance.shutdown(() => {
      // callback(); /*only Working first time, Unknown Bug*/
    });
    LiveServerInstance.close();
    require('live-server').shutdown();
    callback();
  }
}