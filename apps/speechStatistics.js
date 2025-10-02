/** 
 * 此插件原作者：千奈千祁(https://gitee.com/qiannqq)
 * Gitee主页：Gitee.com/QianNQQ
 * Github主页：Github.com/QianNQQ
 * 
 * 本人仅针对于此插件进行改善，可以通过指令直接对于排行榜人数上限进行修改
 */
import common from '../common/common.js'
import puppeteer from "puppeteer";
import path from 'path'
import fs from 'fs'

export class speechStatistics extends plugin {

    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '发言次数统计',
            dsc: '发言次数统计',
            event: 'message.group',
            priority: -1,
            rule: [
                {
                    reg: '',
                    fnc: 'snots',
                    log: false
                },
                {
                    reg: '^发言(日榜|月榜)?$',
                    fnc: 'speechStatistics'
                },
                {
                    reg: '^昨日发言日榜$',
                    fnc: 'yesterdaySpeechStatistics'
                }
            ]
        })
    }

    async snots(e) {
        console.log(e.message[0].type)
        // console.log(date_time)
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            return false
        }
        if (!fs.existsSync(this.dirPath + `/${e.group_id}/`)) {
            fs.mkdirSync(this.dirPath + `/${e.group_id}/`, { recursive: true })
        }

        // 判断消息类型
        const isImage = e.message[0].type === 'image'

        // 处理日榜数据
        await this.updateUserStats(e, 'day', isImage)
        // 处理月榜数据
        await this.updateUserStats(e, 'month', isImage)

        // 保存消息记录（保持不变）
        let message_data
        try {
            message_data = fs.readFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, `utf-8`)
            message_data = JSON.parse(message_data)
        } catch {
            message_data = {}
        }

        if (!message_data[e.user_id]) {
            message_data[e.user_id] = [];
        }
        message_data[e.user_id].push(e.message_id)
        message_data = JSON.stringify(message_data, null, 3)
        fs.writeFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, message_data, `utf-8`)

        return false
    }

    /**
     * 更新用户统计数据
     * @param {*} e 事件对象
     * @param {string} type 统计类型 'day' | 'month'
     * @param {boolean} isImage 是否为图片消息
     */
    async updateUserStats(e, type, isImage) {
        const fileName = type === 'day'
            ? `${await gettoday()}_snots.json`
            : `${await getmonth()}_snots.json`

        const filePath = this.dirPath + `/${e.group_id}/${fileName}`

        let data
        try {
            data = fs.readFileSync(filePath, `utf-8`)
            data = JSON.parse(data)
        } catch {
            data = []
        }

        // 查找用户现有数据
        let userIndex = -1
        for (let i = 0; i < data.length; i++) {
            if (data[i].user_id == e.user_id) {
                userIndex = i
                break
            }
        }

        if (userIndex !== -1) {
            // 更新现有用户数据
            data[userIndex].number = (data[userIndex].number || 0) + 1

            // 如果是图片消息，增加图片计数
            if (isImage) {
                data[userIndex].image = (data[userIndex].image || 0) + 1
            }

            // 更新昵称（可能用户改了群名片）
            data[userIndex].nickname = e.sender.nickname
        } else {
            // 创建新用户数据
            let user_data = {
                user_id: e.user_id,
                nickname: e.sender.nickname,
                number: 1,
                image: isImage ? 1 : 0  // 初始化图片统计
            }
            data.push(user_data)
        }

        // 保存数据
        data = JSON.stringify(data, null, 3)
        fs.writeFileSync(filePath, data, `utf-8`)
    }

    async speechStatistics(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let user_msg = e.msg.match(/^发言(日榜|月榜)?$/)
        let data
        try {
            if (!user_msg[1] || user_msg[1] == `日榜`) {
                let date = await gettoday()
                data = fs.readFileSync(this.dirPath + `/${e.group_id}/${date}_snots.json`, `utf-8`)
            } else {
                let month = await getmonth()
                data = fs.readFileSync(this.dirPath + `/${e.group_id}/${month}_snots.json`, `utf-8`)
            }
            data = JSON.parse(data)
        } catch {
            e.reply(`本群好像还没人说过话呢~`)
            return true
        }
        data.sort((a, b) => b.number - a.number)
        data = data.slice(0, groupcfg.get('Listlimit'))
        let msg = `本群发言榜${user_msg[1] || `日榜`}如下：`
        let div_data = '', paiming = 0, height = 230
        for (let item of data) {
            paiming++
            // 根据是否有图片决定显示内容
            const imageDisplay = item.image ? `，含图片<span class="number">${item.image}</span>张` : ''
            const timeText = user_msg[1] == `日榜` ? '今天' : '本月'

            div_data += `<div class="user">
                        <div class="user-info">第${paiming}名：${item.nickname}(${item.user_id})</div>
                        <div class="secondary-line">
                            <div class="message">${timeText}已发言</div>
                            <span class="number">${item.number}</span>条${imageDisplay}
                        </div>
                        </div>`
        }
        height += 110 * (paiming - 1)
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        });
        const page = await browser.newPage();
        let fontFamily = "Douyin Sans"
        await page.setViewport({ width: 750, height: height });
        await page.setContent(`
        <!DOCTYPE html>
        <html lang="zh_CN">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-image: url('https://s2.loli.net/2024/04/23/Urh1jcsCIP6XHRS.jpg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    font-family: ${fontFamily}; 
                }
                .rounded-box {
                    margin: 10px;
                    width: 730px;
                    height: ${height - 20}px;
                    background-color: transparent;
                    border-radius: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }
                .title {
                    position: relative;
                    left: 20px;
                    top: 10px;
                    color: #000;
                    font-size: 50px;
                    font-weight: bolder;
                }
                .user {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    margin-top: 10px;
                    margin-left: 20px;
                    width: 670px;
                    height: 100px;
                    background-color: rgba(0, 0, 20, 0.6);
                    border-radius: 20px;
                    backdrop-filter: blur(5px);
                    position: relative;
                    top: 10px;
                    color: #fff;
                    font-size: 30px;
                    font-weight: bolder;
                    padding-left: 20px;
                    margin-bottom: 10px;
                }
                .number {
                    background-color: rgb(35, 209, 96);
                    border-radius: 10px;
                    padding: 5px;
                    height: 23px;
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                    margin-left: 5px;
                    font-size: 25px;
                }
                .image-number {
                    background-color: rgb(66, 135, 245);
                    border-radius: 10px;
                    padding: 5px;
                    height: 23px;
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                    margin-left: 5px;
                    font-size: 25px;
                }
                .secondary-line {
                    display: flex;
                    align-items: center;
                    margin-left: 110px;
                }
                .description {
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
                    text-align: center;
                    padding-top: 5px;
                    color: #fff;
                }
            </style>
        </head>
        <body>
            <div class='rounded-box'>
                <div class="title">${msg}</div>
                ${div_data}
                <div class="description"><em>Create By TRSS-Yunzai & Group-Plugin</em></div>
            </div>
        </body>
        </html>
        `)

        await page.screenshot({ path: this.dirPath + `/${e.group_id}/${e.group_id}.png`, clip: { x: 0, y: 0, width: 750, height: height } });
        await browser.close();
        e.reply(segment.image(this.dirPath + `/${e.group_id}/${e.group_id}.png`));
        return true
    }

    async yesterdaySpeechStatistics(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let data
        try {
            // 获取当前日期
            const date = new Date();
            date.setDate(date.getDate() - 1);
            // 格式化为 YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const date_time = `${year}-${month}-${day}`;
            data = fs.readFileSync(this.dirPath + `/${e.group_id}/${date_time}_snots.json`, `utf-8`)
            data = JSON.parse(data)
        } catch (err) {
            console.log(err)
            e.reply(`本群好像还没人说过话呢~`)
            return true
        }
        data.sort((a, b) => b.number - a.number)
        data = data.slice(0, groupcfg.get('Listlimit'))
        let msg = `本群昨日发言榜如下：`
        let div_data = '', paiming = 0, height = 230
        for (let item of data) {
            paiming++
            // 根据是否有图片决定显示内容
            const imageDisplay = item.image ? `，含图片<span class="number">${item.image}</span>张` : ''

            div_data += `<div class="user">
                        <div class="user-info">第${paiming}名：${item.nickname}(${item.user_id})</div>
                        <div class="secondary-line">
                            <div class="message">昨天已发言</div>
                            <span class="number">${item.number}</span>条${imageDisplay}
                        </div>
                        </div>`
        }
        height += 110 * (paiming - 1)
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        });
        const page = await browser.newPage();
        let fontFamily = "Douyin Sans"
        await page.setViewport({ width: 750, height: height });
        await page.setContent(`
        <!DOCTYPE html>
        <html lang="zh_CN">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-image: url('https://s2.loli.net/2024/04/23/Urh1jcsCIP6XHRS.jpg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    font-family: ${fontFamily}; 
                }
                .rounded-box {
                    margin: 10px;
                    width: 730px;
                    height: ${height - 20}px;
                    background-color: transparent;
                    border-radius: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }
                .title {
                    position: relative;
                    left: 20px;
                    top: 10px;
                    color: #000;
                    font-size: 50px;
                    font-weight: bolder;
                }
                .user {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    margin-top: 10px;
                    margin-left: 20px;
                    width: 670px;
                    height: 100px;
                    background-color: rgba(0, 0, 20, 0.6);
                    border-radius: 20px;
                    backdrop-filter: blur(5px);
                    position: relative;
                    top: 10px;
                    color: #fff;
                    font-size: 30px;
                    font-weight: bolder;
                    padding-left: 20px;
                    margin-bottom: 10px;
                }
                .number {
                    background-color: rgb(35, 209, 96);
                    border-radius: 10px;
                    padding: 5px;
                    height: 23px;
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                    margin-left: 5px;
                    font-size: 25px;
                }
                .image-number {
                    background-color: rgb(66, 135, 245);
                    border-radius: 10px;
                    padding: 5px;
                    height: 23px;
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                    margin-left: 5px;
                    font-size: 25px;
                }
                .secondary-line {
                    display: flex;
                    align-items: center;
                    margin-left: 110px;
                }
                .description {
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
                    text-align: center;
                    padding-top: 5px;
                    color: #fff;
                }
            </style>
        </head>
        <body>
            <div class='rounded-box'>
                <div class="title">${msg}</div>
                ${div_data}
                <div class="description"><em>Create By TRSS-Yunzai & Group-Plugin</em></div>
            </div>
        </body>
        </html>
        `)

        await page.screenshot({ path: this.dirPath + `/${e.group_id}/${e.group_id}.png`, clip: { x: 0, y: 0, width: 750, height: height } });
        await browser.close();
        e.reply(segment.image(this.dirPath + `/${e.group_id}/${e.group_id}.png`));
        return true
    }
}

async function gettoday() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const date_time = `${year}-${month}-${day}`;
    return date_time;
}

async function getmonth() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const date_time = `${year}-${month}`;
    return date_time;
}