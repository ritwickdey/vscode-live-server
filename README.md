# Live Server
**_[If you found any bug or if you have any suggetion, feel free to report or suggest me. If you like the extension, don't forgot to rate it.]_**

[![VSCode Marketplace Badge](https://vsmarketplacebadge.apphb.com/version/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Total Install Count Badge](https://vsmarketplacebadge.apphb.com/installs/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![Avarage Rating Badge](https://vsmarketplacebadge.apphb.com/rating-short/ritwickdey.LiveServer.svg)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ritwickdey/vscode-live-server/)
<br>
Launch a development local server directly from VSCode to your browser and watch live preview of HTML<br>
![App Preview](./images/Screenshot/AnimatedPreview.gif)


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
* Live Reload on change of files.
* Run the live server from status bar.
* Fixable Port Number.
* Fixable Server Root.
* Fixable default browser.

## Settings
* `liveServer.settings.port` : Customize Port Number of your Live Server. Default value is `5500`.  If you want random port number, set it as `0`.
* `liveServer.settings.root` : To change root of server in between workspace folder structure,  use `/` and relative path from workspace. _Default value is "`/`".(The Workspace Root)_.
    * _Example: `/sub_folder1/sub_folder2`_. Now `sub_folder2` will be root of the server.

* `liveServer.settings.CustomBrowser` : To change your default browser. Default value is `Null`.

## Installation
Open VSCode Editor and Press `F1`  or `ctrl+shift+P`, type `ext install LiveServer`.

## What's new ?

#### Version 1.4.3 (10.07.2017)
* Status-bar Icon added. Minor Fix update on Status bar control. 

#### Version 1.4.2 (08.07..2017)
* Minor Fix Update on Custom Browser Setting.

#### Version 1.4.1 (07.07.2017)
* Minor Fix Update (Thanks [Adam](https://github.com/AdamLombard))


## Changelog
To check full changelog click here [changelog](CHANGELOG.md).

## LICENSE

This extension is licensed under the [MIT License](LICENSE)