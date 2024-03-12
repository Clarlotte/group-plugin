# group-plugin

## 关于

本插件使用的不是icqq协议，而是使用LiteLoaderQQNT插件将NTQQ支持OneBot11协议进行QQ机器人开发，并搭配[ws-plugin](https://gitee.com/xiaoye12123/ws-plugin)插件对其进行开发，所以，此插件适用于使用OneBot11协议的机器人<br>

针对于如何使用QQNT登录云崽可查看教程[如何使用QQNT登录云崽](http://www.liuil.xyz/2024/03/11/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8QQNT%E7%99%BB%E5%BD%95%E4%BA%91%E5%B4%BD/)(教程内容可能存在部分错误，可以自行issue)<br>
天气查询使用的是[彩云天气API](https://platform.caiyunapp.com/login)（[彩云天气API文档](https://docs.caiyunapp.com/docs/intro)），**key**自行登录获取，由于彩云天气使用的是经纬度坐标进行查询天气，所以这里使用了高德对用户发送的城市进行经纬度转化（[高德开放平台](https://lbs.amap.com/)，并创建web服务应用获取**key**）<br>

## 注意
groupManage中部分指令（入群验证答案，入群审核，自动审核）需要配合另外一个插件进行使用，由于该插件存在部分问题，并没有上传<br>
## 安装与更新

### 使用Git安装（推荐）

// 使用gitee
```
git clone --depth=1 https://gitee.com/clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```
// 使用github

```
git clone --depth=1 https://github.com/Clarlotte/group-plugin.git ./plugins/group-plugin/
pnpm i
```