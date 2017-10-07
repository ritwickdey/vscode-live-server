# Live Server

**_[If you like the extension, [please leave a review](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer#review-details), it puts a smile on my face.]_**

**_[If you found any bug or if you have any suggestion, feel free to report or suggest me.]_**

[![VSCode Marketplace](https://img.shields.io/vscode-marketplace/v/ritwickdey.LiveServer.svg?style=flat-square&label=VSCode%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Total Installs](https://vsmarketplacebadge.apphb.com/installs-short/ritwickdey.LiveServer.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Avarage Rating](https://img.shields.io/vscode-marketplace/r/ritwickdey.LiveServer.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)  
[![Travis branch](https://img.shields.io/travis/ritwickdey/vscode-live-server/master.svg?style=flat-square&label=travis%20build)](https://travis-ci.org/ritwickdey/vscode-live-server) [![Appveyor branch](https://img.shields.io/appveyor/ci/ritwickdey/vscode-live-server.svg?style=flat-square&label=appveyor%20build)](https://ci.appveyor.com/project/ritwickdey/vscode-live-server) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ritwickdey/vscode-live-server/) 
<br>

**Launch a development local Server in live mode of static files (html, css, js, svg).**
<br>

![Live Server Demo VSCode](./images/Screenshot/vscode-live-server-animated-demo.gif)

## Shortcuts to Start/Stop Server

**_[NOTE: In case if you don't have any `.html` or `.htm` file in your workspace then you have to follow method no 4 & 5 to start server.]_**

1. Open a project and directly click to `Go Live` from StatusBar to turn on/off the server. 
![Go Live Control Preview](./images/Screenshot/vscode-live-server-statusbar-3.jpg)

2. Right click on a `HTML` file from Explorer Window & click to `Open with Live Server`. ![Explorer Window Control](./images/Screenshot/vscode-live-server-explorer-menu-demo-1.gif).

3. Open a HTML file and Right click on the editor and choose the options.
![Edit Menu Option Preview](./images/Screenshot/vscode-live-server-editor-menu-3.jpg)

4. Hit `(alt+L, O)` to Open the Server and `(alt+L, C)` to close the server (You can change the shortcut form keybinding). 

5. Press `F1` or `ctrl+shift+P` and type `Live Server: Open With Live Server ` to start a server or type `Live Server: Close Live Server` to stop a server.


## Features
* A Quick Development Live Server.
* Live Reload of HTML files on changes of tracking files.
* Start or close server by a single click from status bar.
* Open a HTML file to browser from Explorer menu.[[Quick Gif Demo](./images/Screenshot/vscode-live-server-explorer-menu-demo-1.gif?raw=true)].
* Support for excluding files for change detection. 
* Hot Shortcut Key control.
* Customizable Port Number.
* Customizable Server Root.
* Customizable default browser.
* Support for Chrome Debugging Attachment (_[More Info](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)_). [[Quick Gif Demo](./images/Screenshot/ChromeDebugging.gif?raw=true)].
* Support for any browser _(Eg: Chrome Canary, Firefox Nightly)_ using advance Command Line.
* Remote Connect through WLAN (E.g.: Connect with mobile) _[Need Help? See FAQ Section]_
* Use preferable host name *(localhost or 127.0.0.1)*.
* Customizable Supporting Tag for Live Reload feature. (Default is `Body` or `head`)
* SVG Support

## Settings

* **`liveServer.settings.port`:** Customize Port Number of your Live Server.  If you want random port number, set it as `0`.
    *  _Default value is `5500`._

    <hr>
 
* **`liveServer.settings.root`:** To change root of server in between workspace folder structure,  use `/` and absolute path from workspace.
    * _Example: `/sub_folder1/sub_folder2`_. Now `sub_folder2` will be root of the server.
    
    *  _Default value is "`/`".(The Workspace Root)_.

    <hr>
 
* **`liveServer.settings.CustomBrowser`:** To change your system's default browser.
    * _Default value is `"Null"` [String, not `null`]. (It will open your system's default browser.)_
    * *Available Options :*
        * chrome
        * chrome:PrivateMode
        * firefox
        * firefox:PrivateMode
        * microsoft-edge

    _Not enough? need more? open an/a issue/pull request on github. For now, use `liveServer.settings.AdvanceCustomBrowserCmdLine` settings (see below)._
    <hr>
 
* **`liveServer.settings.ChromeDebuggingAttachment`:** To Enable Chrome Debugging Attachment to Live Server. [[Quick Gif Demo](./images/Screenshot/ChromeDebugging.gif)].
    * _**NOTE**: You must have to install [ `Debugger for Chrome.`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)_
    
    * _If the value is `true`, Start Live Server and select 'Attach to Chrome' from Debug Window to start debugging. [`Debugger for Chrome`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) Extension will inject debugging feature into running instance of browser window._
   
    *  _Default value is `false`._

    <hr>
    

* **`liveServer.settings.AdvanceCustomBrowserCmdLine`:**  To set your any favorite browser (Eg: Chrome Canary, Firefox Nightly) using advance Command Line. 
    * _This setting will override `CustomBrowser` and `ChromeDebuggingAttachment` settings._
    * _Default Value is `null`_ 
    * _Examples:_
        * _chrome --incognito_
        * _chromecan --remote-debugging-port=9222_
        * _chrome --headless_
        * _chrome --incognito --remote-debugging-port=9222_
    <hr>
* **`liveServer.settings.NoBrowser`:** If it is true live server will start without browser opened.
    
    * _Default Value is `false`_ 

    <hr>
* **`liveServer.settings.ignoreFiles`:** To ignore specific file changes.
    * _Default value is:_
    ```json
    [
        ".vscode/**",
        "**/*.scss",
        "**/*.sass"
    ]
    ```
    Now, by default Live Server will not track changes of your `.scss` &  `.sass` files. 

    <hr>
* **`liveServer.settings.donotShowInfoMsg`:** To turn off information pop-up messages like _"Server starts with port xxxx"_ or like that.  To turn off it, you can set the value as `true` or you can click to _"Don't show again"_ when a information message pop-up.
       
    * _Default value is : `false`_
    
    <hr>
* **`liveServer.settings.host`:** To switch host name between `localhost` and `127.0.0.1` or anything else. 
    * _Default is `127.0.0.1`._
     
    <hr>
* **`liveServer.settings.additionalTagsForLiveReload`:** *(Experimental Feature - BETA)* Live Server injects a requried JS code into Head or Body tag of HTML for enabling Live Reload feature. <br> In case your HTML don't have Body or Head tag, you can define another tags here, so that Live Server can inject the JS code into that tag.
    
     * *Note: Prescience of choosing tag is 'left to right' or 'up to down'. `Body` has highest prescience, then `head` tag.*
     
     * *Example: If body/head tag is missing, it will look for `myTag` tag. If `myTag` tag is also missing, then it will look for `myCustomTag`.*
    ```json
        [
                "myTag", 
                "myCustomTag"
        ]
    ```
    * ***Known Bug***: There is a issue if multiple tag found. 
    <hr>

* **`liveServer.settings.donotVerifyTags`:** To turn off prompt warning message if body or head or other supporting tag is missing in your HTML.
    * _Default value if `false`_



## Installation
Open VSCode Editor and Press `ctrl+P`, type `ext install LiveServer`.


## What's new ?


* ### Version 2.2.1 (07.10.17)
    * ***[Fixed [#26](https://github.com/ritwickdey/vscode-live-server/issues/26)]*** : CPU Overloads due to `**/node_modules/**` folder is fixed - Now `**/node_modules/**` is excluded by default. *(Special Thanks to [Bestvow](https://github.com/bestvow) for the help, Thanks to [user921](https://github.com/user921) for the report).*

    * ***[Fixed]*** Small fixes in Statusbar Button.

* #### Version 2.2.0 (2.10.2017)
    * ***[New]*** Two new options added to `liveServer.settings.CustomBrowser` settings.     
        - `chrome:PrivateMode` 
        - `firefox:PrivateMode` 

        *(For more, see the `setting` section)*.
    
    * ***[New/Enhancement]*** Support for `SVG` files. *(Now right on a `svg` file & click to `Open with live Server`).* 
    
    * ***[Fixed [#27](https://github.com/ritwickdey/vscode-live-server/issues/27)]*** Possibility of add custom hostname. _(Thanks [Alex Lukyanov](https://github.com/lavir) for reporting the issue)_.

* #### Version 2.1.1 (11.09.2017)
    * ***[Enhancement [#22](https://github.com/ritwickdey/vscode-live-server/issues/22) [#23](https://github.com/ritwickdey/vscode-live-server/issues/23)]*** Now you can trun off the warring message for not detecting supporting tag for live reload. _(Thanks [skelesp](https://github.com/skelesp) and [郑国庆](https://github.com/zhengshuai1001) for the feedback)_


## Changelog
To check full changelog [click here](CHANGELOG.md).


## LICENSE
This extension is licensed under the [MIT License](LICENSE)


## FAQ (For Beginners)

### How to configure the settings in my project ?

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

### How to access the server from Mobile ?

 First, make a sure that your PC & Mobile are connected through same network. 

* **Windows** :  Open `CMD` and enter `ipconfig`.
* **Linux/macOS** : Open `terminal` and enter `ifconfig`.

And note down the `IPv4 Address` (probably it will look like 192.168.xx.xx). This is your PC's IP address. Enter the address to your browser's URL Bar with the port number**.

        http://<IP Address> : <Port>

** For an example, if your server running at **http:// 127.0.0.1:3500** on PC then port number is **3500**.


