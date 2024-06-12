# 程序设计在线考试作弊监测系统[![Fork me on Gitee](https://gitee.com/Young_Ya/cheating-detection-client/widgets/widget_1.svg)](https://gitee.com/Young_Ya/cheating-detection-client)

Online cheating Monitoring system for programming

## 🎯简介

本项目旨在设计和实现一个基于深度学习的程序设计在线考试作弊检测系统。系统将提供利用深度学习模型提取图像中的特征，通过屏幕抓取规则进行抓取，对比临近时间内抓取的图像的相似度和差异度，识别考生是否作弊。同时，系统还将提供关键字识别功能，对抓取的屏幕截图进行关键字识别，进一步提高作弊检测的准确性。

## 🎈安装

```bash
$ yarn
```

## 🎉运行

```bash
$ yarn dev
```

## 🔨构建

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## 🔖项目进度

已经完成的功能

- [x] 屏幕定时截图
- [x] 摄像头定时截图
- [x] 应用进程检测
- [x] 动态加载考试平台链接
- [x] 刷新考试界面
- [x] 关闭考试界面，再次进入考试界面
- [x] 人脸识别

未完成的功能

- [ ] 屏幕截图内容GNN处理
- [ ] 截图上传
- [ ] 进程检测记录上传
- [ ] 屏幕处理结果上传

## 😅示例

整体功能运行展示

![整体功能运行示例](/resources/示例.png)

菜单操作部分
![菜单操作栏](/resources/操作菜单.png)

人靓监测部分
![人脸监测](/resources/人脸监测.png)

