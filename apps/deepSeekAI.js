/*
 * @Author: Clarlotte
 * @Date: 2025-06-12 13:17:30
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-14 14:07:51
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
        const DeepSeek_Model = configcfg.get('DeepSeek_Model')
        if (DeepSeek_Model == null || DeepSeek_Model == '') {
            e.reply('请配置 DeepSeek_Model，指令为设置模型<模型名称>')
            return false
        }
        if (DeepSeek_API_Key == null || DeepSeek_API_Key == '') {
            e.reply('请配置 DeepSeek_API_Key 密钥，指令为设置apikey<api密钥>')
            return false
        }
        const openai = new OpenAI({
            baseURL: 'https://api.bltcy.cn/v1',
            apiKey: DeepSeek_API_Key
        })
        try {
            const completion = await openai.chat.completions.create({
                model: DeepSeek_Model,
                messages: [
                    { role: "system", content: `` },
                    { role: "user", content: `${text}` }
                ],
                temperature: 1.3,
            });
            e.reply(`${completion.choices[0].message.content}`, true)
        }
        catch (error) {
            if (error.error == 400) {
                e.reply(`请求错误，请检查您的输入是否正确`)
            }
            else if (error.status == 401) {
                e.reply(`API key错误，认证失败，请检查您的API key是否正确，如没有API key，请先创建API key`,)
            } else if (error.status == 402) {
                e.reply(`账号余额不足，请确认账户余额，并前往充值页面进行充值`)
            } else if (error.status == 422) {
                e.reply(`请求体参数错误，请检查您的输入是否正确`)
            } else if (error.status == 429) {
                e.reply(`请求速率（TPM 或 RPM）达到上限`)
            } else if (error.status == 500) {
                e.reply(`服务器内部错误，请稍后再试`)
            } else if (error.status == 503) {
                e.reply(`服务不可用，请稍后再试`)
            }
        }
    }
}