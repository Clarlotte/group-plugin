# group-plugin
[![Visits Badge](https://badges.pufler.dev/visits/clarlotte/group-plugin)](https://gitee.com/clarlotte/group-plugin/)

## 关于

本人才疏学浅，代码写得很难，所以大家体谅一下，本插件功能是根据我自身需求进行编写，可能部分功能对你们没有用处，所以所有功能均设置了指令开关（所有功能均默认关闭），如果需要其他的功能，可以提交issue，后续可能加上

指令开启/关闭群管，默认关闭，关闭群管之后，插件内所有功能无效

本插件使用的不是icqq协议，而是使用LiteLoaderQQNT插件将NTQQ支持OneBot11协议进行QQ机器人开发

关于插件中的定时任务，自行前往schedule.js中修改

天气查询使用的是[彩云天气API](https://platform.caiyunapp.com/login)（[彩云天气API文档](https://docs.caiyunapp.com/docs/intro)），**key**自行登录获取，由于彩云天气使用的是经纬度坐标进行查询天气，所以这里使用了高德对用户发送的城市进行经纬度转化（[高德开放平台](https://lbs.amap.com/)，并创建web服务应用获取**key**），这两个key分别可使用指令设置高德token，设置天气token直接进行设置（如有其他api可自行进行修改weatherInquiry.js中的代码）

AI聊天采用的是[柏拉图AI](https://api.bltcy.cn/register?aff=OiRD)相比下，比官方的便宜点，api密钥在注册登录之后，点击工作台-令牌-添加令牌，然后点击提交，在key(密钥)处复制即可，私发机器人指令`设置apikey<api>`，然后在柏拉图支持模型中，选择一个自己心仪的模型，私发机器人`设置模型<模型名称>`即可，在此柏拉图AI中，每个令牌分组的收费标准不一，请选择自己合适的令牌分组，并在令牌列表，编辑中，可以自行添加自己的令牌分组。
这个AI聊天记得在云崽目录下执行npm i openai指令

## 如何安装llonebot-docker

<details><summary>展开/收起</summary>

1. 我这里使用的是[llonebot-docker](https://github.com/LLOneBot/llonebot-docker)中方案二LLWebuiApi登录，先下载llonebot-docker镜像
```sh
sudo docker run -d --name onebot-docker0 --add-host=host.docker.internal:host-gateway -e VNC_PASSWD=vncpasswd -p 3000:3000 -p 6099:6099 -p 3001:3001 -v ${PWD}/LiteLoader:/opt/QQ/resources/app/LiteLoader mlikiowa/llonebot-docker:latest 
```
其中vncpasswd换成你的VNC密码

然后浏览器访问`http://你的docker-ip:6099/api/panel/getQQLoginQRcode`扫码登录

登录之后访问`http://你的docker-ip:6099/plugin/LLOneBot/iframe.html`进行 llonebot 的配置

2. 扫码登陆后，在配置界面添加反向 WebSocket 监听地址

将`ws://host.docker.internal:2536/OneBotv11`添加到反向 WebSocket 监听地址中并保存

3. 安装TRSS-Yunzai

请根据网络情况选择使用 GitHub 或 Gitee 安装

```sh
git clone --depth 1 https://github.com/TimeRainStarSky/Yunzai
git clone --depth 1 https://gitee.com/TimeRainStarSky/Yunzai
cd Yunzai
npm i -g pnpm
pnpm i
```

4. 启动TRSS-Yunzai

```sh
node app
#后台启动
pm2 start node --name TRSS-Yunzai -- app
#查看日志
pm2 logs TRSS-Yunzai
#重启云崽服务
pm2 restart TRSS-Yunzai
```

</details>

## 安装与更新

### 使用Git安装（推荐）

```sh
git clone --depth=1 https://gitee.com/clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```
### 使用github

```sh
git clone --depth=1 https://github.com/Clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```

排行榜使用的是图片发送，需要系统中安装宋体，将宋体的文件拷贝到服务器/usr/share/fonts/truetype，然后依次执行

这里提供一个[宋体文件](https://wwb.lanzouq.com/icUHg1uju2ra)，[抖音美好体](https://wwb.lanzouq.com/i9TgF1w964fi)自行下载
```sh
apt install xfonts-utils
sudo mkfontscale
sudo mkfontdir
sudo fc-cache -fv
```
重启云崽即可

如果没有/usr/share/fonts/truetype该文件，执行`apt install fontconfig`，使用`fc-list`查看所有安装了的字体

显示这样就是安装成功

![](https://s2.loli.net/2024/04/10/t2lH8xjFOkJGEmX.png)

## 功能说明

所有指令目前均不支持`/`、`#`等符号<br>

<details><summary>展开/收起</summary>

1. 今日日报<br>
![今日日报](resources/images/%E4%BB%8A%E6%97%A5%E6%97%A5%E6%8A%A5.png)
2. 禁言解禁<br>
![禁言解禁](resources/images/%E7%A6%81%E8%A8%80%E8%A7%A3%E7%A6%81.png)
3. 天气查询<br>
![天气查询](resources/images/%E5%A4%A9%E6%B0%94%E6%9F%A5%E8%AF%A2.png)
4. 发言日榜（月榜）/昨日发言日榜<br>
![发言日榜](resources/images/%E5%8F%91%E8%A8%80%E6%97%A5%E6%A6%9C.png)
5. 批量撤回<br>
![批量撤回](resources/images/%E6%89%B9%E9%87%8F%E6%92%A4%E5%9B%9E.png)
6. 赞我<br>
![赞我](resources/images/%E8%B5%9E%E6%88%91.png)
7. 设置日报Api<br>
8. 设置高德token<br>
9. 设置天气token<br>
10.系统状态<br>
11.(开启|关闭)日报推送<br>
12.(开启|关闭)定时禁言<br>
13.设置发言榜人数上限10<br>
14..踢<br>
</details>