# Live Server
**_[If you like the extension, [please leave a review](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer#review-details), it puts a smile on my face.]_**

**_[If you found any bug or if you have any suggestion, feel free to report or suggest me.]_**

[![VSCode Marketplace Badge](https://vsmarketplacebadge.apphb.com/version/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Total Install](https://vsmarketplacebadge.apphb.com/installs/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Avarage Rating Badge](https://vsmarketplacebadge.apphb.com/rating-short/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ritwickdey/vscode-live-server/)
<br>
Launch a development local server directly from VSCode to your browser and watch live preview of HTML
<br>
![Live Server Demo VSCode](./images/Screenshot/AnimatedPreview.gif)

## Usage/Shortcuts

**_[NOTE: In case if you don't have any `.html` or `.htm` file in your workspace then you have to follow method no 3 & 4 to start Live Server. I don't know why you want so?! :p But feature is still there.]_**

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
* Support for any browser _(Eg: Chrome Canary, Firefox Nightly)_ using advance Command Line.
* Remote Connect (E.g.: Connect with mobile) _[Need Help? See FAQ Section]_


## Settings

* **`liveServer.settings.port` :** Customize Port Number of your Live Server.  If you want random port number, set it as `0`.
    *  _Default value is `5500`._

    <hr>
 
* **`liveServer.settings.root` :** To change root of server in between workspace folder structure,  use `/` and absolute path from workspace.
    * _Example: `/sub_folder1/sub_folder2`_. Now `sub_folder2` will be root of the server.
    *  _Default value is "`/`".(The Workspace Root)_.

    <hr>
 
* **`liveServer.settings.CustomBrowser` :** To change your system's default browser. (_chrome_ or _firefox_ or _Microsoft-Edge_).
    * _Default value is `"Null"` [String, not `null`]. (It will open your system's default browser.)_

    <hr>
 
* **`liveServer.settings.ChromeDebuggingAttachment` :** To Enable Chrome Debugging Attachment to Live Server. [[Quick Gif Demo](./images/Screenshot/ChromeDebugging.gif)].
    * _**NOTE**: You must have to install [ `Debugger for Chrome.`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)_
    * _If the value is `true`, Start Live Server and select 'Attach to Chrome' from Debug Window to start debugging. [`Debugger for Chrome`](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) Extension will inject debugging feature into running instance of browser window._
    *  _Default value is `false`._

    <hr>

* **`liveServer.settings.AdvanceCustomBrowserCmdLine` :**  To set your any favorite browser (Eg: Chrome Canary, Firefox Nightly) using advance Command Line. 
    * _This setting will override `CustomBrowser` and `ChromeDebuggingAttachment` settings._
    * _Default Value is `null`_ 
    * _Examples:_
        * _chrome --incognito_
        * _chromecan --remote-debugging-port=9222_
        * _chrome --headless_
        * _chrome --incognito --remote-debugging-port=9222_
    <hr>
* **`liveServer.settings.NoBrowser` :** If it is true live server will start without browser opened.
    * _Default Value is `false`_ 

    <hr>

## Installation
Open VSCode Editor and Press `ctrl+P`, type `ext install LiveServer`.


## What's new ?

* #### Version 1.6.7 (30.07.2017)
    * *[New Settings]* `liveServer.settings.NoBrowser` - If it is true live server will start without browser opened.

* #### Version 1.6.6 (28.07.2017)
    * Remote Connect :  Change something into HTML/CSS/JS from your PC and watch the effect to your phone with live reload. _[Need Help? See FAQ Section]_
    * `.htm` support.

* #### Version 1.6.5 (26.07.2017)
    *  Bug Fixed for Linux & macOS. Sometime extension was crashing if `liveServer.settings.CustomBrowser` settings is not provided by manually on macOS & Linux. 



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
    "liveServer.settings.NoBrowser" : false

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
