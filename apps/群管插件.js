import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import path from 'path'

const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'

export class groupSetting extends plugin {
    dirPath = path.resolve('./plugins/groupSetting/data')
    constructor() {
        super({
            name: "群管功能",
            dsc: "对群进行管理",
            /** https://oicqjs.github.io/oicq/#events */
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: '^(添加|删除)入群验证(.+)$',
                    fnc: 'groupComment',
                },
                {
                    reg: '^查看入群验证答案$',
                    fnc: 'viewGroupComment',
                },
                {
                    reg: '^(开启|关闭)群申请通知$',
                    fnc: 'groupNoticeSet',
                },
                {
                    reg: '^(开启|关闭)日报推送$',
                    fnc: 'set60sDayNews',
                },
                {
                    reg: '^(开启|关闭)自动审核$',
                    fnc: 'setAtuoExamine',
                },
                {
                    reg: '^设置入群等级限制([0-9]+)$',
                    fnc: 'setGroupLevel',
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

    async getList(key, groupcfg) {
        return groupcfg.get(key)
    }

    async groupComment(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp('^(添加|删除)入群验证(.+)$')
        let option = reg.exec(e.msg)[1]
        let comment = reg.exec(e.msg)[2]
        let msg = ['入群验证：\n']
        if (groupcfg.get("comment").includes(comment) && option == '添加') {
            e.reply(`该关键词已存在，无需重复添加`)
        } else {
            let arr = groupcfg.get('comment')
            if (option == '添加') {
                if (Array.isArray(arr)) {
                    arr.push(comment)
                } else {
                    arr = [comment]
                }
                groupcfg.set('comment', arr)
            } else if (option == '删除') {
                if (Array.isArray(arr))
                    for (let j = 0; j < arr.length; j++) {
                        if (arr[j] == comment) {
                            arr.splice(j, 1)
                            groupcfg.set('comment', arr)
                            break
                        }
                    }
            }
            arr = await this.getList('comment', groupcfg)
            if (Array.isArray(arr) && arr.length != 0) {
                msg.push(arr.join('\n'))
            } else {
                msg.push('无')
            }
            e.reply(msg)
        }
        return true
    }

    async viewGroupComment(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let arr = await this.getList('comment', groupcfg)
        let msg = ['入群验证：\n']
        if (Array.isArray(arr) && arr.length != 0) {
            msg.push(arr.join('\n'))
        } else {
            msg.push('无')
        }
        e.reply(msg)
    }

    async groupNoticeSet(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp(`^(开启|关闭)群申请通知`)
        let option = reg.exec(e.msg)[1]
        if (option == '开启') {
            groupcfg.set('groupNotice', true)
            e.reply('群申请通知已开启，我将会在有新成员申请入群时提醒你们哟~')
            return true
        }
        else if (option == '关闭') {
            groupcfg.set('groupNotice', false)
            e.reply('群申请通知已关闭')
            return true
        }
    }

    async set60sDayNews(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
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

    async setAtuoExamine(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp(`^(开启|关闭)自动审核`)
        let option = reg.exec(e.msg)[1]
        if (option == '开启') {
            groupcfg.set('AtuoExamine', true)
            e.reply('自动审核入群已开启')
            return true
        }
        else if (option == '关闭') {
            groupcfg.set('AtuoExamine', false)
            e.reply('自动审核入群已关闭')
            return true
        }
    }

    async setGroupLevel(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp('^设置入群等级限制([0-9]+)$')
        let level = Number(reg.exec(e.msg)[1])
        groupcfg.set('Levellimit', level)
        e.reply(`已成功将入群等级限制修改为${level}级`)
    }

    async setListLimit(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
        }
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        let reg = new RegExp('^设置发言榜人数上限([0-9]+)$')
        let num = Number(reg.exec(e.msg)[1])
        groupcfg.set('Listlimit', num)
        e.reply(`已成功将设置发言榜人数上限修改为${num}人`)
    }

    async GroupBan(e) {
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
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
        if (e.sender.role == 'member') {
            e.reply(`暂无权限，只有群主和管理员才能操作`)
            return false
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

