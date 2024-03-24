import common from '../common/common.js'
import path from 'path'

export class thumbUp extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '点赞',
            dsc: '机器人点赞',
            event: 'message',
            priority: '-1',
            rule: [
                {
                    reg: '^赞我$',
                    fnc: 'thumbUp',
                }
            ]
        })
    }

    async thumbUp(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let isSuccess = await e.bot.sendApi("send_like", {
            user_id: e.user_id,
            times: 20,
        })
        if (isSuccess.status == 'ok') {
            e.reply(`我已成功赞你10次，记得回赞哟`)
        } else {
            e.reply(`点赞失败，原因可能是今日已经赞过了或我俩并非好友`)
        }
    }
}