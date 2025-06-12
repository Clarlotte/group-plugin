/*
 * @Author: Clarlotte
 * @Date: 2025-06-12 13:17:30
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 15:41:06
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/deepSeekAI.js
 * @Descripttion: 
 */
import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import OpenAI from 'openai'

export class deepseekAI extends plugin {
    constructor() {
        super({
            name: 'deepseekAI',
            event: 'message',
            priority: 200,
            rule: [
                {
                    reg: 'chat([\\s\\S]*)$',
                    fnc: 'chat'
                },
            ]
        })
    }

    async chat(e) {
        let text = e.msg.replace('chat', '');
        let configcfg = common.getConfigYaml()
        let DeepSeek_API_Key = configcfg.get('DeepSeek_API_Key')
        if (!DeepSeek_API_Key) {
            e.reply('请先前往group_plugin/config/config/config.yaml中配置 DeepSeek_API_Key')
            return false
        }
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: DeepSeek_API_Key
        })

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: `` },
            { role: "user", content: `${text}` }
            ],
            model: "deepseek-chat",
        });
        e.reply(`${completion.choices[0].message.content}`, true)
        console.log(completion.choices[0].message.content)
    }
}