import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import path from 'path'

const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'

export class groupManage extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: "群管功能",
            dsc: "对群进行管理",
            /** https://oicqjs.github.io/oicq/#events */
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: '^(开启|关闭)群管$',
                    fnc: 'setGroupManage',
                },
                {
                    reg: '^(开启|关闭)日报推送$',
                    fnc: 'set60sDayNews',
                },
                {
                    reg: '^设置发言榜人数上限([0-9]+)$',
                    fnc: 'setListLimit',
                },
                {
                    reg: `^禁言\\s?((\\d+)\\s)?(${Numreg})?(分|分钟|时|小时|天)?$`,
                    fnc: 'GroupBan',
                },
                {
                    reg: '^解禁(\\d+)?$',
                    fnc: 'GroupunBan',
                },

            ]
        })
    }

    async setGroupManage(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp(`^(开启|关闭)群管`)
        let option = reg.exec(e.msg)[1]
        if ((e.sender.role != 'owner') && (!e.isMaster)) {
            e.reply(`暂无权限，只有主人和群主才可以进行操作`)
            return false
        }
        if (option == '开启') {
            groupcfg.set('GroupManage', true)
            e.reply(`该群群管功能已开启`)
            return true
        }
        else {
            groupcfg.set('GroupManage', false)
            e.reply(`该群群管功能已关闭`)
            return true
        }
    }

    async set60sDayNews(e) {
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
        let reg = new RegExp(`^(开启|关闭)日报推送`)
        let option = reg.exec(e.msg)[1]
        if (option == '开启') {
            groupcfg.set('DayNewsSet', true)
            e.reply('日报推送已开启，将会在每天早上8点准时推送~')
            return true
        }
        else if (option == '关闭') {
            groupcfg.set('DayNewsSet', false)
            e.reply('日报推送已关闭，发送指令：今日日报也可查看')
            return true
        }
    }

    async setListLimit(e) {
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
        let reg = new RegExp('^设置发言榜人数上限([0-9]+)$')
        let num = Number(reg.exec(e.msg)[1])
        groupcfg.set('Listlimit', num)
        e.reply(`已成功将设置发言榜人数上限修改为${num}人`)
    }

    async GroupBan(e) {
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
        let self_data = await e.bot.sendApi("get_group_member_info", {
            group_id: e.group_id,
            user_id: e.self_id,
        })
        if (self_data.role == 'member') {
            e.reply(`暂无权限，我无权对任何人进行此操作`)
            return false
        }
        let ban_data = await e.bot.sendApi("get_group_member_info", {
            group_id: e.group_id,
            user_id: e.at,
        })
        if (ban_data.role != 'member') {
            e.reply(`暂无权限，我无权对群主或管理员进行此操作`)
            return false
        }
        let reg = new RegExp(`^禁言\\s?((\\d+)\\s)?(${Numreg})?(分|分钟|时|小时|天)?$`)
        let time = common.translateChinaNum(e.msg.match(reg)[3])
        let option = e.msg.match(reg)[4]
        if (option == '分' || option == '分钟') {
            let BanTime = time * 60
            e.group.muteMember(e.at, BanTime)
        }
        else if (option == '时' || option == '小时') {
            let BanTime = time * 60 * 60
            e.group.muteMember(e.at, BanTime)
        }
        else if (option == '天') {
            let BanTime = time * 60 * 60 * 24
            e.group.muteMember(e.at, BanTime)
        }
    }

    //解禁群成员
    async GroupunBan(e) {
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
        let self_data = await e.bot.sendApi("get_group_member_info", {
            group_id: e.group_id,
            user_id: e.self_id,
        })
        if (self_data.role == 'member') {
            e.reply(`暂无权限，我无权对任何人进行此操作`)
            return false
        }
        e.group.muteMember(e.at, 0)
    }
}

