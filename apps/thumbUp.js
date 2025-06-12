/*
 * @Author: Clarlotte
 * @Date: 2025-06-10 19:49:08
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 13:27:04
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/thumbUp.js
 * @Descripttion: 
 */
import common from "../common/common.js";
import path from "path";

export class thumbUp extends plugin {
  dirPath = path.resolve("./plugins/group-plugin/data");
  constructor() {
    super({
      name: "点赞",
      dsc: "机器人点赞",
      event: "message",
      priority: "-1",
      rule: [
        {
          reg: "^赞我$",
          fnc: "thumbUp",
        },
      ],
    });
    this.checkFriend = true; // 默认需要检查用户是否是好友,false则开启陌生人点赞
  }

  async thumbUp(e) {
    let groupcfg = common.getGroupYaml(this.dirPath, e.group_id);
    if (!groupcfg.get("GroupManage")) {
      e.reply("该群群管功能未开启，请发送开启群管启用该群的群管功能");
      return false;
    }
    let userId = e.user_id;
    // 判断用户是否是好友
    // if (this.checkFriend) {
    //   // let isFriend = await (e.bot ?? Bot).fl.get(userId);
    //   // console.log(isFriend)
    //   if (!isFriend) {
    //     let msg = [
    //       // segment.image(
    //       //   `https://api.lolimi.cn/API/preview/api.php?qq=${userId}&msg=%E4%BD%A0%E5%A5%BD&msg2=%E7%AC%A8%E8%9B%8B&type=102`
    //       // ),
    //       `不加好友不赞🙄`,
    //     ];
    //     e.reply(msg, true, { recallMsg: 60 });//60秒后撤回
    //     return;
    //   }
    // }
    let isSuccess = await e.bot.pickFriend(e.user_id).thumbUp(10);
    if (isSuccess.status == "ok") {
      let msg = [
        // segment.image(
        //   `https://api.lolimi.cn/API/preview/api.php?qq=${userId}&msg=%E4%BD%A0%E5%A5%BD&msg2=%E7%AC%A8%E8%9B%8B&type=29`
        // ),
        `我已经赞你10次,记得回赞哦！`,
      ];
      e.reply(msg, true, { recallMsg: 60 });//60秒后撤回
    } else {
      let msg = [
        // segment.image(
        //   `https://api.lolimi.cn/API/preview/api.php?qq=${userId}&msg=%E4%BD%A0%E5%A5%BD&msg2=%E7%AC%A8%E8%9B%8B&type=66`
        // ),
        `笨蛋今天已经赞过了!`,
      ];
      e.reply(msg, true, { recallMsg: 60 });//60秒后撤回
    }
  }
}
