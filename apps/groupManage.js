import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import group from '../models/group.js'
import path from 'path'

const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'

export class groupManage extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: "群管功能",
            dsc: "对群进行管理",
            event: "message.group",
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
                    reg: '^(开启|关闭)定时禁言$',
                    fnc: 'setAutoMute',
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
                {
                    reg: `^踢(\\d+)?$`,
                    fnc: 'kickGroupMember',
                },
                {
                    reg: `^设置管理(\\d+)?$`,
                    fnc: 'setGroupManager',
                },
                {
                    reg: `^撤销管理(\\d+)?$`,
                    fnc: 'cancelGroupManager',
                },
                // {
                //     reg: `^我要头衔(.+)$`,
                //     fnc: 'giveTitle',
                // },
                // {
                //     reg: '^我不想要头衔了',
                //     fnc: 'cancelTitle',
                // },
                // {
                //     reg: '^撤销头衔(\\d+)?$',
                //     fnc: 'repealTitle',
                // },
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

    async setAutoMute(e) {
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
        let reg = new RegExp(`^(开启|关闭)定时禁言`)
        let option = reg.exec(e.msg)[1]
        if (option == '开启') {
            groupcfg.set('AutoMute', true)
            e.reply('定时禁言已开启，请自行设置禁言时长')
            return true
        }
        else if (option == '关闭') {
            groupcfg.set('AutoMute', false)
            e.reply('定时禁言已关闭')
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
        console.log(e)
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
        if (!e.group.is_admin && !e.group.is_owner) {
            e.reply(`暂无权限，我无权对任何人进行此操作`)
            return false
        }
        if (e.at == null) {
            e.reply(`没有指定需要禁言的人，我不知道需要对谁禁言哟`)
            return false
        }
        if (e.bot.pickMember(e.at).is_admin || e.bot.pickMember(e.at).is_owner) {
            e.reply(`暂无权限，我无权对群主或管理员进行此操作`)
            return false
        }

        let reg = new RegExp(`^禁言\\s?((\\d+)\\s)?(${Numreg})?(分|分钟|时|小时|天)?$`)
        let time = group.translateChinaNum(e.msg.match(reg)[3])
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
        if (e.at == null) {
            e.reply(`没有指定需要解禁的人，我不知道需要对谁解禁哟`)
            return false
        }
        e.group.muteMember(e.at, 0)
    }

    async kickGroupMember(e) {
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
        if (e.at == null) {
            e.reply(`我不知道你要踢谁哟，请指定一下再进行操作吧`)
            return false
        }
        e.group.kickMember(e.at)
        e.reply(`我已成功将他踢出`, true)
    }

    //设置管理
    async setGroupManager(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        if (!e.group.is_owner) return false
        if (e.at == null) return false
        if (!e.isMaster) return false
        if (e.bot.pickMember(e.at).is_admin) {
            e.reply(`此人已经是本群的管理了，无法进行设置`)
        } else {
            e.bot.sendApi("set_group_admin", {
                group_id: e.group_id,
                user_id: e.at,
                enable: true,
            })
            let remsg = [`已经成功将`, segment.at(e.at), `设置为本群管理了`]
            e.reply(remsg)
        }
    }

    //取消管理
    async cancelGroupManager(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        if (!e.group.is_owner) return false
        if (e.at == null) return false
        if (!e.isMaster) return false
        if (e.bot.pickMember(e.at).is_admin) {
            e.reply(`此人不是本群的管理了，无法进行设置`)
        } else {
            e.bot.sendApi("set_group_admin", {
                group_id: e.group_id,
                user_id: e.at,
                enable: false,
            })
            let remsg = [`已经成功取消`, segment.at(e.at), `本群管理了`]
            e.reply(remsg)
        }
    }

    // //我要头衔
    // async giveTitle(e) {
    //     let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
    //     if (!groupcfg.get('GroupManage')) {
    //         e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
    //         return false
    //     }
    //     let reg = new RegExp('^我要头衔(.+)$')
    //     let title = reg.exec(e.msg)[1]
    //     if (!e.group.is_owner) return false
    //     if (title.length > 6 || title.length <= 0) {
    //         e.reply(`头衔最大长度为6，请重新输入`)
    //     } else {
    //         console.log(await e.bot.sendApi("set_group_special_title", {
    //             group_id: e.group_id,
    //             user_id: e.user_id,
    //             special_title: title,
    //             // duration,
    //         }))
    //         e.reply(`已为你成功将头衔设置为${title}`)
    //     }

    // }

    // //我不想要头衔了
    // async cancelTitle(e) {
    //     let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
    //     if (!groupcfg.get('GroupManage')) {
    //         e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
    //         return false
    //     }
    //     if (!e.group.is_owner) return false
    //     e.bot.pickGroup.setTitle(e.user_id, '');
    //     e.reply(`头衔撤销成功了`);
    // }

    // //撤销头衔
    // async repealTitle(e) {
    //     let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
    //     if (!groupcfg.get('GroupManage')) {
    //         e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
    //         return false
    //     }
    //     if (!e.group.is_owner) return false
    //     if (!e.bot.pickMember(e.user_id).is_admin && !e.bot.pickMember(e.user_id).is_owner) {
    //         if (!e.isMaster) {
    //             e.reply(`暂无权限，只有主人、群主或管理员才能操作`)
    //             return false
    //         }
    //     }
    //     if (e.at == null) {
    //         e.reply(`没有指定撤销谁的头衔，我不知道需要撤销谁的头衔`)
    //         return false
    //     }
    //     e.group.setTitle(qq, '')
    //     e.reply(`头衔已撤销成功`)
    // }
}

