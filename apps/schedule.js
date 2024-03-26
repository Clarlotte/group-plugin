import plugin from '../../../lib/plugins/plugin.js'
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
            {
                cron: '0 0 0 * * *',
                name: '自动删除（天）',
                fnc: () => this.delDayFiles()
            },
            {
                cron: '0 0 0 1 * ?',
                name: '自动删除（月）',
                fnc: () => this.delMonthFiles()
            }
        ]
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

    async delMonthFlies() {
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