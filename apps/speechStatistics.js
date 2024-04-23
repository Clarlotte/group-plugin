/** 
 * 此插件原作者：千奈千祁(https://gitee.com/qiannqq)
 * Gitee主页：Gitee.com/QianNQQ
 * Github主页：Github.com/QianNQQ
 * 
 * 本人仅针对于此插件进行改善，可以通过指令直接对于排行榜人数上限进行修改
 * 并对于排行榜进行优化以图片方式进行输出（界面过于丑陋，可以自行使用putteteer重新渲染一张背景）
 */
import Canvas from "canvas"
import common from '../common/common.js'
import puppeteer from "puppeteer";
import path from 'path'
import fs from 'fs'

const imageBase64 = ""

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
                    reg: '^今日逼话王$',
                    fnc: 'king'
                }
            ]
        })
    }

    async king(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        let data
        try {
            let date = await gettoday()
            data = fs.readFileSync(this.dirPath + `/${e.group_id}/${date}_snots.json`, `utf-8`)
            data = JSON.parse(data)
        } catch {
            e.reply(`本群好像还没人说过话呢~`)
            return true
        }
        data.sort((a, b) => b.number - a.number)
        let msg = [
            `今日逼话王非`,
            segment.at(data[0].user_id),
            `莫属，他今日共发言${data[0].number}条`
        ]
        await e.reply(msg)
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
        let div_data = '', paiming = 0, height = 220
        for (let item of data) {
            paiming++
            div_data += `<div class="user">第${paiming}名：${item.nickname}(${item.user_id})<br>              今天已发言${item.number}条</div>\n`
        }
        height += 120 * (paiming - 1)
        console.log(height)
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        });
        const page = await browser.newPage();
        let fontFamily = "Douyin Sans"
        await page.setViewport({ width: 800, height: height });
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
                    width: 780px;
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
                .user{
                    display: grid;
                    justify-content: flex-start;
                    place-items: center;
                    margin: 20px;
                    width: 720px;
                    height: 100px;
                    background-color: rgba(0, 0, 20, 0.6);
                    border-radius: 10px;
                    backdrop-filter: blur(5px);
                    position: relative;
                    top: 10px;
                    color: #fff;
                    font-size: 30px;
                    font-weight: bolder;
                    padding-left: 20px; 
                    white-space: pre-wrap;
                    margin-bottom: 10px
                }
            </style>
        </head>
        <body>
            <div class='rounded-box'>
                <div class="title">${msg}</div>
                ${div_data}
            </div>
        </body>
        </html>
        `)
        await page.screenshot({ path: this.dirPath + `/${e.group_id}/${e.group_id}.png`, clip: { x: 0, y: 0, width: 800, height: height } });
        await browser.close();
        e.reply(segment.image(this.dirPath + `/${e.group_id}/${e.group_id}.png`));
        return true
    }

    async snots(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            return false
        }
        if (!fs.existsSync(this.dirPath + `/${e.group_id}/`)) {
            fs.mkdirSync(this.dirPath + `/${e.group_id}/`, { recursive: true })
        }

        let data, message_data;
        let date = await gettoday()
        try {
            data = fs.readFileSync(this.dirPath + `/${e.group_id}/${date}_snots.json`, `utf-8`)
            data = JSON.parse(data)
            message_data = fs.readFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, `utf-8`)
            message_data = JSON.parse(message_data)
        } catch {
            data = []
            message_data = {}
        }
        let temp_data = []
        for (let item of data) {
            if (item.user_id == e.user_id) temp_data.push(item)
        }
        if (temp_data.length > 0) {
            await deljson(temp_data[0], this.dirPath + `/${e.group_id}/${date}_snots.json`)
            await autochuli(temp_data, this.dirPath + `/${e.group_id}/${date}_snots.json`)
        } else {
            let user_data = {
                user_id: e.user_id,
                nickname: e.sender.nickname,
                number: 1
            }
            data.push(user_data)
            data = JSON.stringify(data, null, 3)
            fs.writeFileSync(this.dirPath + `/${e.group_id}//${date}_snots.json`, data, `utf-8`)
        }
        let month = await getmonth()
        try {
            data = fs.readFileSync(this.dirPath + `/${e.group_id}/${month}_snots.json`, `utf-8`)
            data = JSON.parse(data)
        } catch {
            data = []
        }
        temp_data = []
        for (let item of data) {
            if (item.user_id == e.user_id) temp_data.push(item)
        }
        if (temp_data.length > 0) {
            await deljson(temp_data[0], this.dirPath + `/${e.group_id}/${month}_snots.json`)
            await autochuli(temp_data, this.dirPath + `/${e.group_id}/${month}_snots.json`)
        } else {
            let user_data = {
                user_id: e.user_id,
                nickname: e.sender.nickname,
                number: 1
            }
            data.push(user_data)
            data = JSON.stringify(data, null, 3)
            fs.writeFileSync(this.dirPath + `/${e.group_id}/${month}_snots.json`, data, `utf-8`)
        }
        if (!message_data[e.user_id]) {
            message_data[e.user_id] = [];
        }
        message_data[e.user_id].push(e.message_id)
        message_data = JSON.stringify(message_data, null, 3)
        fs.writeFileSync(this.dirPath + `/${e.group_id}/${e.group_id}_message.json`, message_data, `utf-8`)
        return false
    }
}

async function autochuli(data, filePath) {
    data[0].number++
    let new_data = fs.readFileSync(filePath, `utf-8`)
    new_data = JSON.parse(new_data)
    new_data.push(data[0])
    new_data = JSON.stringify(new_data, null, 3)
    fs.writeFileSync(filePath, new_data)
}
/**
 * 删除JSON数组内容
 * @param {*} deldata 要删除的数据
 * @param {string} filePath 路径
 */
async function deljson(deldata, filePath) {
    try {
        let data = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(data);
        if (!Array.isArray(data)) return false;
        let filteredData = []
        for (let item of data) {
            item = JSON.stringify(item)
            deldata = JSON.stringify(deldata)
            if (item != deldata) {
                item = JSON.parse(item)
                filteredData.push(item)
                deldata = JSON.parse(deldata)
            }
        }

        const tempData = JSON.stringify(filteredData, null, 3);
        fs.writeFileSync(filePath, tempData, 'utf-8');
        return true;
    } catch (error) {
        console.error('Error processing the file', error);
        return false;
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