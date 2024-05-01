import common from '../common/common.js'
import path from 'path'
import fs from 'fs'

export class speechStatistics extends plugin {

    dirPath = path.resolve('./plugins/group-plugin/data')

    constructor() {
        super({
            name: '批量撤回',
            dsc: '批量撤回',
            event: 'message.group',
            priority: -1,
            rule: [
                {
                    reg: '^批量撤回\\s?((\\d+)\\s)?(\\d+)$',
                    fnc: 'BatchRecall',
                }
            ]
        })
    }

    async BatchRecall(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        if (e.sender.role == 'member') {
            if (!e.isMaster) {
                e.reply(`暂无权限，只有主人、群主或管理员才能操作`)
                return false
            }
        }
        let reg = new RegExp(`^批量撤回\\s?((\\d+)\\s)?(\\d+)$`)
        let num = e.msg.match(reg)[3]
        let data = fs.readFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, `utf-8`)
        data = JSON.parse(data)
        let i = 1
        while (1) {
            let message_id = data[e.at][data[e.at].length - 1]
            e.group.recallMsg(message_id)
            data[e.at].pop()
            i++
            if (i > num) break
        }
        data = JSON.stringify(data, null, 3)
        fs.writeFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, data, `utf-8`)
    }
}