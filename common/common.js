import yaml from 'js-yaml'
import fs from 'fs'

let YamlReader = await import('/root/Yunzai/plugins/group-plugin/config/yamlreader.js')
YamlReader = YamlReader.default
let pathAddr = process.cwd().replace(/\\/g, '/')

function translateChinaNum(s_123) {
    if (!s_123 && s_123 != 0) return s_123
    // 如果是纯数字直接返回
    if (/^\d+$/.test(s_123)) return Number(s_123)
    // 字典
    let map = new Map()
    map.set('一', 1)
    map.set('壹', 1) // 特殊
    map.set('二', 2)
    map.set('两', 2) // 特殊
    map.set('三', 3)
    map.set('四', 4)
    map.set('五', 5)
    map.set('六', 6)
    map.set('七', 7)
    map.set('八', 8)
    map.set('九', 9)
    // 按照亿、万为分割将字符串划分为三部分
    let split = ''
    split = s_123.split('亿')
    let s_1_23 = split.length > 1 ? split : ['', s_123]
    let s_23 = s_1_23[1]
    let s_1 = s_1_23[0]
    split = s_23.split('万')
    let s_2_3 = split.length > 1 ? split : ['', s_23]
    let s_2 = s_2_3[0]
    let s_3 = s_2_3[1]
    let arr = [s_1, s_2, s_3]

    // -------------------------------------------------- 对各个部分处理 --------------------------------------------------
    arr = arr.map(item => {
        let result = ''
        result = item.replace('零', '')
        // [ '一百三十二', '四千五百', '三千二百一十三' ] ==>
        let reg = new RegExp(`[${Array.from(map.keys()).join('')}]`, 'g')
        result = result.replace(reg, substring => {
            return map.get(substring)
        })
        // [ '1百3十2', '4千5百', '3千2百1十3' ] ==> ['0132', '4500', '3213']
        let temp
        temp = /\d(?=千)/.exec(result)
        let num1 = temp ? temp[0] : '0'
        temp = /\d(?=百)/.exec(result)
        let num2 = temp ? temp[0] : '0'
        temp = /\d?(?=十)/.exec(result)
        let num3
        if (temp === null) { // 说明没十：一百零二
            num3 = '0'
        } else if (temp[0] === '') { // 说明十被简写了：十一
            num3 = '1'
        } else { // 正常情况：一百一十一
            num3 = temp[0]
        }
        temp = /\d$/.exec(result)
        let num4 = temp ? temp[0] : '0'
        return num1 + num2 + num3 + num4
    })
    // 借助parseInt自动去零
    return parseInt(arr.join(''))
}

const wind_level = [
    { range: [1, 6], level: '1级' },
    { range: [6, 12], level: '2级' },
    { range: [12, 20], level: '3级' },
    { range: [20, 29], level: '4级' },
    { range: [29, 39], level: '5级' },
    { range: [39, 50], level: '6级' },
    { range: [50, 62], level: '7级' },
    { range: [62, 75], level: '8级' },
    { range: [75, 89], level: '9级' },
    { range: [89, 103], level: '10级' },
    { range: [103, 118], level: '11级' },
    { range: [118, 134], level: '12级' },
    { range: [134, 150], level: '13级' },
    { range: [150, 167], level: '14级' },
    { range: [167, 184], level: '15级' },
    { range: [184, 202], level: '16级' },
    { range: [202, 220], level: '17级' },
];

const wind_direction = [
    { range: [0, 11.26], direction: '北' },
    { range: [11.26, 33.76], direction: '北东北' },
    { range: [33.76, 56.26], direction: '东北' },
    { range: [56.26, 78.76], direction: '东东北' },
    { range: [78.76, 101.26], direction: '东' },
    { range: [101.26, 123.76], direction: '东东南' },
    { range: [123.76, 146.26], direction: '东南' },
    { range: [146.26, 168.76], direction: '南东南' },
    { range: [168.76, 191.26], direction: '南' },
    { range: [191.26, 213.76], direction: '南西南' },
    { range: [213.76, 236.26], direction: '西南' },
    { range: [236.26, 258.76], direction: '西西南' },
    { range: [258.76, 281.26], direction: '西' },
    { range: [281.26, 303.76], direction: '西西北' },
    { range: [303.76, 326.26], direction: '西北' },
    { range: [326.26, 348.76], direction: '北西北' },
    { range: [248.76, 360], direction: '北' },
];


function get_wind_level(speed, dire) {
    let level = null, directions = null
    for (const item of wind_level) {
        const range = item.range
        if (speed >= range[0] && speed < range[1]) {
            level = item.level
            break
        }
    }

    for (const item of wind_direction) {
        const range = item.range
        if (dire >= range[0] && dire < range[1]) {
            directions = item.direction
            break
        }
    }
    return directions + '风' + level
}

function readJsonFile(filePath) {
    let jsonData;

    try {
        // 使用 fs.readFileSync() 方法同步读取文件
        const data = fs.readFileSync(filePath, 'utf8');

        // 解析JSON数据并赋值给jsonData
        jsonData = JSON.parse(data);
        // console.log('读取的JSON数据:', jsonData);
    } catch (error) {
        console.error('读取文件时出错:', error);
    }

    // 返回解析后的 JSON 数据
    return jsonData;
}

function getGroupYaml(dirPath, group_id) {
    if (!fs.existsSync(dirPath + `/${group_id}/`)) {
        fs.mkdirSync(dirPath + `/${group_id}/`, { recursive: true })
    }
    if (!fs.readdirSync(dirPath + `/${group_id}/`, 'utf-8').includes(group_id + '.yaml')) {
        let groupPath = dirPath + `/${group_id}/` + group_id + '.yaml'
        let Data = {
            //每日60s定时推送开关，默认true
            DayNewsSet: true,
            //发言榜榜单上线人数，默认10
            Listlimit: 10,
        }
        fs.writeFileSync(groupPath, yaml.dump(Data), 'utf-8')
    }
    let groupcfg = new YamlReader(pathAddr + '/plugins/group-plugin/data/' + `/${group_id}/` + group_id + '.yaml', true)
    return groupcfg
}

export default { translateChinaNum, get_wind_level, readJsonFile, getGroupYaml }