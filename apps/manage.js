import { config } from 'process'
import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import group from '../models/group.js'
import path from 'path'

export class autoDaily60s extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '每日60s',
            dsc: '每日60s',
            event: 'message',
            priority: 1,
            rule: [
                {

                    reg: '^设置日报Api(https?://[\\w./?=&]+)$', // 匹配自定义API指令和URL
                    fnc: 'setDailyApi'
                },
                {
                    reg: '^设置高德token([\\w]+)$',
                    fnc: 'setGeoToken'
                },
                {
                    reg: '^设置天气token([\\w]+)$',
                    fnc: 'setWeatherToken'
                },
            ]
        })
    }

    async setDailyApi(e) {
        if (e.isPrivate) {
            const Daily_Api = e.msg.match(/设置日报Api(https?:\/\/[\w\-.\/?=&%]+)$/)
            if (!Daily_Api || !Daily_Api[1]) {
                e.reply('指令格式错误，请使用正确的格式：设置日报Api<API地址>')
                return false
            }
            let configcfg = common.getConfigYaml()
            configcfg.set("Daily_Api", Daily_Api[1])
            e.reply(`设置成功，日报API已设置为：${Daily_Api[1]}`)
        }
        else {
            e.reply('请在私聊中设置')
        }
    }

    async setGeoToken(e) {
        if (e.isPrivate) {
            const Geo_Token = e.msg.match(/设置高德token([\w]+)/)
            if (!Geo_Token || !Geo_Token[1]) {
                e.reply('指令格式错误，请使用正确的格式：设置高德token<token>')
                return false
            }
            let configcfg = common.getConfigYaml()
            configcfg.set("Geo_Token", Geo_Token[1])
            e.reply(`设置成功，高德token已设置为：${Geo_Token[1]}`)
        }
        else {
            e.reply('请在私聊中设置')
        }
    }

    async setWeatherToken(e) {
        if (e.isPrivate) {
            const Weather_Token = e.msg.match(/设置天气token([\w]+)/)
            if (!Weather_Token || !Weather_Token[1]) {
                e.reply('指令格式错误，请使用正确的格式：设置天气token<token>')
                return false
            }
            let configcfg = common.getConfigYaml()
            configcfg.set("Weather_Token", Weather_Token[1])
            e.reply(`设置成功，天气token已设置为：${Weather_Token[1]}`)
        }
        else {
            e.reply('请在私聊中设置')
        }
    }
}