# Live Server
**_[If you found any bug or if you have any suggestion, feel free to report or suggest me. If you like the extension, don't forgot to rate it.]_**

[![VSCode Marketplace Badge](https://vsmarketplacebadge.apphb.com/version/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Total Install](https://vsmarketplacebadge.apphb.com/installs/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Avarage Rating Badge](https://vsmarketplacebadge.apphb.com/rating-short/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ritwickdey/vscode-live-server/)
<br>
Launch a development local server directly from VSCode to your browser and watch live preview of HTML
<br>
![Live Server Demo VSCode](./images/Screenshot/AnimatedPreview.gif)

## Usage/Shortcuts

**_[In case if you don't have any `.html` file in your workspace then you have to follow method no 3 & 4 to start Live Server. I don't know why you want so?! :p But feature is still there.]_**

1. Open a HTML File/Project and directly Click to `Go Live` from StatusBar to turn off/on the server. 
![Go Live Control Preview](./images/Screenshot/statusbar2.jpg)

2. Open a HTML file and Right click on the editor and choose the options.
![Edit Menu Option Preview](./images/Screenshot/editormenu2.jpg)

3. Hit `(alt+L, O)` to Open the Server and `(alt+L, C)` to close the server. 

4. Press `F1` or `ctrl+shift+P` and type `Live Server: Open Live Server ` to start a server or type `Live Server: Close Live Server` to stop a server.

## Features
* A Quick Development Live Server.
* Live Reload on change of HTML files.
* Run the live server from status bar.
* Quick Statusbar control.
* Customizable Port Number.
* Customizable Server Root.
* Customizable default browser.
* Support for Chrome Debugging Attachment (_[More Info](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)_). [[Quick Gif Demo](./images/Screenshot/ChromeDebugging.gif)].
* Support for any browser (Eg: Chrome Canary, Firefox Nightly) using advance Command Line.


## Settings

* **`liveServer.settings.port` :** Customize Port Number of your Live Server.  If you want random port number, set it as `0`.
    *  _Default value is `5500`._

    <hr>
 
* **`liveServer.settings.root` :** To change root of server in between workspace folder structure,  use `/` and absolute path from workspace.
    * _Example: `/sub_folder1/sub_folder2`_. Now `sub_folder2` will be root of the server.
    *  _Default value is "`/`".(The Workspace Root)_.

    <hr>
 
* **`liveServer.settings.CustomBrowser` :** To change your system's default browser. (_chrome_ or _firefox_ or _Microsoft-Edge_).
    * _Default value is `Null`. (It will open your system's default browser.)_

    <hr>
 
* **`liveServer.settings.ChromeDebuggingAttachment` :** To Enable Chrome Debugging Attachment to Live Server. [[Quick Gif Demo](./images/Screenshot/ChromeDebugging.gif)].
    * _**NOTE**: You must have to install [ `Debugger for Chrome.`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)_
    * _If the value is `true`, Start Live Server and select 'Attach to Chrome' from Debug Window to start debugging. [`Debugger for Chrome`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) Extension will inject debugging feature into running instance of browser window._
    *  _Default value is `false`._

    <hr>

* **`liveServer.settings.AdvanceCustomBrowserCmdLine` :**  To set your any favorite browser (Eg: Chrome Canary, Firefox Nightly) using advance Command Line. 
    * _This setting will override `CustomBrowser` and `ChromeDebuggingAttachment` settings._
    * _Examples:_
        * _chrome --incognito_
        * _chromecan --remote-debugging-port=9222_
        * _chrome --headless_
        * _chrome --incognito --remote-debugging-port=9222_
    <hr>

## Installation
Open VSCode Editor and Press `ctrl+P`, type `ext install LiveServer`.


## How to config the settings in my project? (FAQ):
Create a `.vscode` folder in the root of project. Inside of `.vscode` folder create a json file named `settings.json`.
Inside of the `settings.json`, type following key-value pairs. By the way you'll get intelli-sense.

```json
{
    "liveServer.settings.port": 4500,
    "liveServer.settings.root": "/src",
    "liveServer.settings.CustomBrowser" : "microsoft-edge",
    "liveServer.settings.AdvanceCustomBrowserCmdLine": "chrome --incognito --remote-debugging-port=9222"
}
```



## What's new ?

* #### Version 1.6.3 (24.07.2017)
    * Validation added for Port range.

* #### Version 1.6.2 (22.07.2017)
    * Fixed error handling for unavailable port.

* #### Version 1.6.1 (20.07.2017)
    * Fixed Update - Extension was not opening system's default browser. _[Sorry for that, Extension was crashing internally]_.


## Changelog
To check full changelog click here [changelog](CHANGELOG.md).

## LICENSE

This extension is licensed under the [MIT License](LICENSE)