/*
 * @Author: Clarlotte
 * @Date: 2025-06-10 19:49:08
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 13:27:21
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/weatherInquiry.js
 * @Descripttion: 
 */
import weather from '../models/weather.js'
import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import axios from 'axios'
import path from "path"

export class weatherInquiry extends plugin {
    dirPath = path.resolve("./plugins/group-plugin/data")
    constructor() {
        super({
            name: '天气查询',
            dsc: '查询指定城市天气',
            event: 'message.group',
            priority: 1,
            rule: [
                {

                    reg: '(.+)天气$',
                    fnc: 'weatherInquiry'
                },
            ]
        })
    }

    async weatherInquiry(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let configcfg = common.getConfigYaml()
        let geo_key = configcfg.get('Geo_Token'), weather_key = configcfg.get('Weather_Token')
        if (geo_key == '' || weather_key == '') {
            e.reply('天气功能配置不全，请在config.js中进行配置')
            return false
        }
        const cityName = e.msg.split('天气')[0]
        let gaode_url = `https://restapi.amap.com/v3/geocode/geo?address=${cityName}&output=JSON&key=${geo_key}`
        const gaode_response = await axios.get(gaode_url)
        if (gaode_response.data.info == 'INVALID_USER_KEY') {
            e.reply(`天气配置不正确，请检查高德token是否正确`)
            return false
        }
        //检查是否存在 cityName
        const status = gaode_response.data.status
        if (!(status == '1')) {
            e.reply(`无法查询到该城市的实况天气，请检查是否拼写正确`, true)
            return false
        }
        const province = gaode_response.data.geocodes[0].province
        const city = gaode_response.data.geocodes[0].city
        const district = gaode_response.data.geocodes[0].district
        if (province.includes(cityName) || city.includes(cityName) || district.includes(cityName)) {//存在 cityName
            //获取城市 cityName 格式化地址
            let formatted_address = gaode_response.data.geocodes[0].formatted_address
            //获取城市 cityName 经纬度坐标
            let location = gaode_response.data.geocodes[0].location
            const weather_url = `https://devapi.qweather.com/v7/weather/now?location=${location}&key=${weather_key}`
            const weather_response = await axios.get(weather_url)
            //获取城市 cityName 当前实况天气
            console.log(weather_response.data)
            const weather_data = weather_response.data.now
            console.log(weather_data)
            //获取城市 cityName 预警信息
            // const weather_alert = weather_response.data.result.alert
            //获取城市 cityName 风速
            const wind_speed = weather_data.windSpeed
            //获取城市 cityName 风向角度
            const wind_direction = weather_data.wind360
            //将获取到的风速风向角度转化为风力等级
            const wind_level = weather.get_wind_level(wind_speed, wind_direction)
            //获取城市 cityName 天气情况
            // const skycon_data = common.readJsonFile('./plugins/group-plugin/config/weather_skycon.json')
            const weather_condition = weather_data.text
            // if (weather_alert == null) {
            let msg = [
                `${formatted_address}当前天气如下：\n`,
                `当前天气：${weather_condition}\n`,
                `温度：${weather_data.temp}℃\n`,
                `体感温度：${weather_data.feelsLike}℃\n`,
                `相对湿度：${weather_data.humidity}%\n`,
                `风力：${wind_level}\n`,
                // `空气质量：${weather_data.air_quality.description.chn}  ${weather_data.air_quality.aqi.chn}\n`,
                `本地降水强度：${weather_data.precip}mm/hr`,
            ]
            e.reply(msg)
            //e.reply(`预警信息：${weather_alert.content[0].description}`)
            // } else {
            //     let msg = [
            //         `${formatted_address}当前天气如下：\n`,
            //         `当前天气：${weather_condition}\n`,
            //         `温度：${weather_data.temperature}℃\n`,
            //         `体感温度：${weather_data.apparent_temperature}℃\n`,
            //         `相对湿度：${Math.round(weather_data.humidity * 100)}%\n`,
            //         `风力：${wind_level}\n`,
            //         `空气质量：${weather_data.air_quality.description.chn}  ${weather_data.air_quality.aqi.chn}\n`,
            //         `本地降水强度：${weather_data.precipitation.local.intensity}mm/hr`,
            //     ]
            //     e.reply(msg, true)
            // }
        } else {
            e.reply(`无法查询到该城市的实况天气，请检查是否拼写正确`, true)
        }
    }
}