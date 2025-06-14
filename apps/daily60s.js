/*
 * @Author: Clarlotte
 * @Date: 2025-06-10 19:49:08
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 13:19:26
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/daily60s.js
 * @Descripttion: 
 */
import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import axios from 'axios'
import path from 'path'

export class autoDaily60s extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '每日60s',
            dsc: '每日60s',
            event: 'notice' && 'message.group',
            priority: 1,
            rule: [
                {

                    reg: '今日日报$',
                    fnc: 'send60sDayNews'
                },
            ]
        })
    }

    async send60sDayNews(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let configcfg = common.getConfigYaml()
        let url = configcfg.get('Daily_Api')
        const response = await axios.get(url)
        const imageUrl = response.data.imageUrl || response.data.data.image
        console.log(imageUrl)
        let msg = segment.image(imageUrl, false, 120)
        e.reply(msg)
    }
}