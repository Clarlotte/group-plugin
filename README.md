# group-plugin

## 关于

指令开启/关闭群管，默认关闭，关闭群管之后，插件内所有功能无效（如果需要其他的功能，可以提交issue）

本插件使用的不是icqq协议，而是使用LiteLoaderQQNT插件将NTQQ支持OneBot11协议进行QQ机器人开发，并搭配[ws-plugin](https://gitee.com/xiaoye12123/ws-plugin)插件对其进行开发，所以，此插件适用于使用OneBot11协议的机器人<br>

针对于如何使用QQNT登录云崽可查看教程[如何使用QQNT登录云崽](https://gitee.com/clarlotte/docker-qqnt)(教程内容可能存在部分错误，可以自行issue)<br>

天气查询使用的是[彩云天气API](https://platform.caiyunapp.com/login)（[彩云天气API文档](https://docs.caiyunapp.com/docs/intro)），**key**自行登录获取，由于彩云天气使用的是经纬度坐标进行查询天气，所以这里使用了高德对用户发送的城市进行经纬度转化（[高德开放平台](https://lbs.amap.com/)，并创建web服务应用获取**key**），将这两个key填入config/config.js中<br>

## 安装与更新

### 使用Git安装（推荐）

```
git clone --depth=1 https://gitee.com/clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```
### 使用github

```
git clone --depth=1 https://github.com/Clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```

排行榜使用的是图片发送，需要系统中安装宋体
将宋体的.tff文件拷贝到服务器/usr/share/fonts/truetype，然后依次执行
```
apt install xfonts-utils
sudo mkfontscale
sudo mkfontdir
sudo fc-cache -fv
```

## 功能说明

所有指令均无`/`、`#`等符号，如需，请自行添加<br>

<details><summary>展开/收起</summary>

1. 今日日报<br>
![今日日报](https://s2.loli.net/2024/03/12/ed5NiS9tI6VDavn.png)
2. 日报推送<br>
![日报推送](https://s2.loli.net/2024/03/12/mYvcIKzHklhtsV9.jpg)
3. 禁言解禁<br>
![禁言解禁](https://s2.loli.net/2024/03/12/oJsKZtadzDV7ALH.jpg)
4. 天气查询<br>
![天气查询](https://s2.loli.net/2024/03/12/Kbx1EkUT9pO75Pm.jpg)<br>
5.发言日榜（月榜）<br>
![发言日榜](https://s2.loli.net/2024/03/12/QVkUE3ejnNfmOGZ.jpg)

</details>