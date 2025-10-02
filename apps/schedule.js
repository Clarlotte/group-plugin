/*
 * @Author: Clarlotte
 * @Date: 2025-06-10 19:49:08
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 13:26:37
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/schedule.js
 * @Descripttion: 
 */
import plugin from '../../../lib/plugins/plugin.js'
import common from '../common/common.js'
import axios from 'axios'
import path from 'path'
import fs from 'fs'

export class schedule extends plugin {
    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '自动事件',
            dsc: '自动事件',
            priority: 1,
            rule: []
        })
        this.task = [
            this.task = {
                cron: '0 0 8 * * ?',
                /**
                 * cron表达式：
                 * 秒 分 时 天 周 月
                 * '0 0 8 * * ?'代表每天八点执行
                 */
                name: '自动推送每日日报',
                fnc: () => this.push60s()
            },
            {
                cron: '0 0 0 * * *',
                name: '自动禁言',
                fnc: () => this.muteAll()
            },
            {
                cron: '0 0 8 * * *',
                name: '自动解禁',
                fnc: () => this.unMuteAll()
            },
            {
                cron: '0 0 0 * * *',
                name: '自动删除（天）',
                fnc: () => this.delDayFiles()
            },
            {
                cron: '0 0 0 1 * ?',
                name: '自动删除（月）',
                fnc: () => this.delMonthFiles()
            },
        ]
    }

    async push60s() {
        const groupList = Bot.getGroupList()
        let configcfg = common.getConfigYaml()
        let url = configcfg.get('Daily_Api')
        const response = await axios.get(url)
        const imageUrl = response.data.imageUrl
        for (let i = 1; i < groupList.length; i++) {
            let groupcfg = common.getGroupYaml(this.dirPath, groupList[i])
            if (!groupcfg.get('GroupManage')) continue
            if (groupcfg.get('DayNewsSet')) {
                let msg = segment.image(imageUrl, false, 120)
                await Bot.pickGroup(groupList[i]).sendMsg(msg)
                Bot.pickGroup(groupList[i]).sendMsg(`今日早报已送达，请注意查收~`)
            }
        }
    }

    async muteAll() {
        const groupList = Bot.getGroupList()
        for (let i = 1; i < groupList.length; i++) {
            let groupcfg = common.getGroupYaml(this.dirPath, groupList[i])
            if (!groupcfg.get('GroupManage')) continue
            if (groupcfg.get('AutoMute')) {
                await Bot.pickGroup(groupList[i]).muteAll(true)
                Bot.pickGroup(groupList[i]).sendMsg(`每日0:00至8:00开启全体禁言`)
            }
        }
    }

    async unMuteAll() {
        const groupList = Bot.getGroupList()
        for (let i = 1; i < groupList.length; i++) {
            let groupcfg = common.getGroupYaml(this.dirPath, groupList[i])
            if (!groupcfg.get('GroupManage')) continue
            if (groupcfg.get('AutoMute')) {
                await Bot.pickGroup(groupList[i]).muteAll(false)
                Bot.pickGroup(groupList[i]).sendMsg(`每日0:00至8:00开启全体禁言`)
            }
        }
    }

    async delDayFiles() {
        // 获取当前日期
        const currentDate = new Date();
        // 获取前一天的日期
        const previousDate = new Date(currentDate);
        previousDate.setDate(currentDate.getDate() - 1);
        // 格式化前一天的日期
        const year = previousDate.getFullYear();
        const month = String(previousDate.getMonth() + 1).padStart(2, '0');
        const day = String(previousDate.getDate()).padStart(2, '0');
        const formattedPreviousDate = `${year}-${month}-${day}`;
        fs.readdir(this.dirPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err)
                return
            }
            const directories = files.filter(file => fs.statSync(this.dirPath + '/' + file).isDirectory());
            for (let i = 0; i < directories.length; i++) {
                fs.unlink(this.dirPath + `/${directories[i]}/${formattedPreviousDate}_snots.json`, (err) => {
                    if (err) {
                        console.log('File deleted failed or file does not exist.')
                    } else {
                        console.log('File deleted successfully.')
                    }
                })
            }
        })
    }

    async delMonthFiles() {
        // 获取当前日期
        const currentDate = new Date();
 
        // 获取上一个月的年份和月份
        let previousYear = currentDate.getFullYear();
        let previousMonth = currentDate.getMonth() - 1;
        if (previousMonth < 0) {
            previousMonth = 11; // 如果当前月份是一月，则上个月是十二月
            previousYear -= 1; // 如果当前月份是一月，则年份减一
        }
        previousMonth += 1
        const formattedPreviousDate = `${previousYear}-${previousMonth}`;
        fs.readdir(this.dirPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err)
                return
            }
            const directories = files.filter(file => fs.statSync(this.dirPath + '/' + file).isDirectory());
            for (let i = 0; i < directories.length; i++) {
                fs.unlink(this.dirPath + `/${directories[i]}/${formattedPreviousDate}_snots.json`, (err) => {
                    if (err) {
                        console.log('File deleted failed or file does not exist.')
                    } else {
                        console.log('File deleted successfully.')
                    }
                })
            }
        })
    }
}