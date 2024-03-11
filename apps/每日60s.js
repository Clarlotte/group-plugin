import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import axios from 'axios'
import path from 'path'

const pushTime = '0 0 8 * * ?'

export class autoDaily60s extends plugin {
    dirPath = path.resolve('./plugins/groupSetting/data')
    constructor() {
        super({
            name: '每日60s',
            dsc: '每日60s',
            event: 'notice' && 'message',
            priority: 1,
            rule: [
                {

                    reg: '今日日报$',
                    fnc: 'send60sDayNews'
                },
            ]
        })
        this.task = {
            cron: pushTime,
            name: '自动推送每日日报',
            fnc: () => this.push60s()
        }
    }

    async send60sDayNews(e) {
        let url = 'http://api.2xb.cn/zaob'
        const response = await axios.get(url)
        const imageUrl = response.data.imageUrl
        let msg = segment.image(imageUrl, false, 120)
        e.reply(msg)
    }

    async push60s() {
        const groupList = Bot.getGroupList()
        let url = 'http://api.2xb.cn/zaob'
        let response = await axios.get(url)
        const imageUrl = response.data.imageUrl
        for (let i = 1; i < groupList.length; i++) {
            let groupcfg = common.getGroupYaml(this.dirPath, groupList[i])
            let msg = segment.image(imageUrl, false, 120)
            if (groupcfg.get('DayNewsSet')) {
                await Bot.pickGroup(groupList[i]).sendMsg(msg)
                Bot.pickGroup(groupList[i]).sendMsg(`今日早报已送达，请注意查收~`)
            }
        }
    }
}