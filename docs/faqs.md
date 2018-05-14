# FAQs

- [FAQs](#faqs)
    - [How to configure the settings in my project?](#how-to-configure-the-settings-in-my-project)
    - [How to use Live Server Web Extension?](#how-to-use-live-server-web-extension)
    - [How to setup Live Server for Dynamic Pages (like PHP)?](#how-to-setup-live-server-for-dynamic-pages-like-php)
    - [How to access the server from Mobile?](#how-to-access-the-server-from-mobile)
----------

## How to configure the settings in my project?

Create a `.vscode` folder in the root of project. Inside of `.vscode` folder create a json file named `settings.json`.
Inside of the `settings.json`, type following key-value pairs. By the way you'll get intelli-sense.

```json
{
    "liveServer.settings.port": 4500,
    "liveServer.settings.root": "/src",
    "liveServer.settings.CustomBrowser" : "chrome",
    "liveServer.settings.AdvanceCustomBrowserCmdLine": "chrome --incognito --remote-debugging-port=9222",
    "liveServer.settings.NoBrowser" : false,
    "liveServer.settings.ignoreFiles" : [
            ".vscode/**",
            "**/*.scss",
            "**/*.sass"
    ]

}
```
_Note: Use either `CustomBrowser` or `AdvanceCustomBrowserCmdLine` setting._

----------

## How to use Live Server Web Extension?

*  Please [check here](https://github.com/ritwickdey/live-server-web-extension) 

----------

## How to setup Live Server for Dynamic Pages (like PHP)?

*  Please [check here](https://github.com/ritwickdey/live-server-web-extension) 

----------



## How to access the server from Mobile?

 First, make a sure that your PC & Mobile are connected through same network. 

* **Windows** :  Open `CMD` and enter `ipconfig`.
* **Linux/macOS** : Open `terminal` and enter `ifconfig`.

And note down the `IPv4 Address` (probably it will look like 192.168.xx.xx). This is your PC's IP address. Enter the address to your browser's URL Bar with the port number**.

        http://<IP Address> : <Port>

** For an example, if your server running at **http:// 127.0.0.1:3500** on PC then port number is **3500**.

----------

## Are Multi-root workspaces supported?

Currently there is no support for multi-root workspaces. It's automatically the first folder in the workspace choosen.
The current state of this issue you can track [here](https://github.com/ritwickdey/vscode-live-server/issues/43).
