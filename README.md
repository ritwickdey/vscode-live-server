# Live Server PP

## 描述

项目来自 Live Server，在原有功能上增加了以下功能

* 支持websocket 消息服务，可以用于调试websocket 客户端
* 支持可编程虚拟文件，可用于模拟服务端API接口

## 截图

![Live Server Demo VSCode](https://github.com/Zhou-zhi-peng/vscode-live-server/raw/master/images/Screenshot/vscode-live-server-animated-demo.gif)

![Live Server Demo VSCode](https://github.com/Zhou-zhi-peng/vscode-live-server/raw/master/images/Screenshot/003.png)

## 使用方法

**_[注：原功能使用方法请参考 Live Server [说明文档](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer). ]_**

## websocket 消息服务

1. websocket 客户端连接：
直接使用  Live Server端口进行连接，连接路径默认为：WSService 例如 Live Server服务端口是8080，则可使用以下地址进行连接：
ws://127.0.0.1:80/WSService
 连接成功后,列表中将看到该连接。

![Go Live Control Preview](https://github.com/Zhou-zhi-peng/vscode-live-server/raw/master/images/Screenshot/005.png)

2.收发消息：
点击该连接，将打开消息发送界面，该界面上可以查看消息收发历史和发送消息.

![Explorer Window Control](https://github.com/Zhou-zhi-peng/vscode-live-server/raw/master/images/Screenshot/006.png).

## 虚拟文件服务

1. 新建虚拟文件：
在虚拟文件栏中新建一个虚拟文件，虚拟文件可用支持 直接输入内容、通过脚本生成内容 或 链接到一个已存在的文件。
![Explorer Window Control](https://github.com/Zhou-zhi-peng/vscode-live-server/raw/master/images/Screenshot/007.png).

2. 脚本使用方法：
内容脚本，将在以个函数中运行，函数原型：
`function (request:IncomingMessage,resonse:ServerResponse):void`
IncomingMessage 和 ServerResponse 均为NodeJS中的HTTP Server库中的对象，具体使用方式参考相关文档。


## LICENSE

This extension is licensed under the [MIT License](LICENSE)
