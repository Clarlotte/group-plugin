#### 由于我本人Linux服务器没有图形化界面，所以此教程适用于没有图形化界面的Linux服务器。下面来进行操作（没有docker的自行安装docker）：

```bash
docker pull ilharp/qqnt:master-16-linux-amd64-up3.1.1-11223
```

```bash
docker run -itd --name ntqq --add-host=host.docker.internal:host-gateway -p 6080:80 -p 5901 -e VNC_PASSWD=0813 docker.io/ilharp/qqnt:master-16-linux-amd64-up3.1.1-11223 /sbin/my_init -- bash -l
```

其中VNC_PASSWD=0813可自行修改密码

```bash
docker ps -a #查看docker容器
```

![image-20240311201249390](https://s2.loli.net/2024/03/12/mCublYyTexkrPEM.png)

```bash
docker exec -it containerID前三位 bash #进入容器终端
apt update #更新容器软件包列表
apt install wget unzip git #安装unzip
cd /tmp
wget https://dldir1.qq.com/qqfile/qq/QQNT/852276c1/linuxqq_3.2.5-21453_amd64.deb
chmod 0777 linuxqq_3.2.5-21453_amd64.deb
sudo dpkg -i linuxqq_3.2.5-21453_amd64.deb
```

如果服务器是root用户，则：`vim /etc/runit/runsvdir/default/qqnt/run`把里的`/opt/QQ/qq`改成：`/opt/QQ/qq --no-sandbox`

然后按`ctrl + d`退出容器终端，回到宿主机终端，重启一下容器：
`docker restart  containerID`前三位,然后访问`服务器ip:6080`就能登录qq了

至此，docker容器里面的qq更新完成

```bash
docker exec -it containerID前三位 bash #进入容器终端
cd /tmp
wget https://d.kstore.space/download/2656/pic/install_linux.sh
bash install_linux.sh
cd /opt/LiteLoader/plugins/
wget https://github.com/LLOneBot/LLOneBot/releases/download/v3.11.0/LLOneBot.zip
unzip LLOneBot.zip -d ./LLOneBot
```

然后按`ctrl + d`退出容器终端，重启容器：
`docker restart containerID`，然后访问`服务器IP:6080`，登录QQ，就可以在QQ设置中看到该插件

![image-20240311203852886](https://s2.loli.net/2024/03/12/p4CRqfKsG5ArNZe.png)

![image-20240311203911889](https://s2.loli.net/2024/03/12/QUpsCNq2oxTh6bJ.png)

```bash
ctrl + d #退出容器终端
docker ps -a #记下容器前三位id
docker stop 容器id
docker commit -a "作者随便填英文的" -m "onebot-ntqq" 容器id ntqq:master
docker run -itd --restart=always --name ntqq --add-host=host.docker.internal:host-gateway -p 6080:80 -p 5901 -e VNC_PASSWD=0813 815c1b5a25a1 /sbin/my_init -- bash -l #VNC_PASSWD可自行修改
docker rm -f 容器id
docker rmi ilharp/qqnt:master-16-linux-amd64-up3.1.1-11223
```

在设置中填写反向websoket地址：`ws://host.docker.internal:2536/go-cqhttp`

ffmpeg路径`/usr/bin/ffmpeg`

在容器中执行

```bash
apt install ffmpeg -y
```

![image-20240311204350676](https://s2.loli.net/2024/03/12/BR9xvhC5aHe8AtT.png)

至此，docker容器操作结束，我们返回宿主机，安装

[TRSS-Yunzai]: https://gitee.com/TimeRainStarSky/Yunzai

然后安装

[ws-plugin]: https://gitee.com/xiaoye12123/ws-plugin

然后`node app`运行一下云崽，生成配置文件，完事后直接`ctrl+c`，然后将方框中的内容填写在`ws-plugin/config/config/ws-config.yaml`中

![image-20240311205042713](https://s2.loli.net/2024/03/12/OkzP4GXF12wZt5L.png)

```javascript
# 连接服务列表
servers: 
  # 添加连接方式, 可添加多个
    # 连接名字  请保证每个名字都不相同,否则会出问题
  - name: ntqq
    # 连接地址
    address: ws://localhost:2536/go-cqhttp
    # 连接类型 1:反向 Websocket 2:正向 Websocket 3:gsuid_core
    type: 1
    # 重连间隔 单位:秒
    reconnectInterval: 5
    # 最大连接次数 0 为无限制
    maxReconnectAttempts: 0
    uin: stdin
```