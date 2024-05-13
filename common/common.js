import yaml from 'js-yaml'
import fs from 'fs'

let pathAddr = process.cwd().replace(/\\/g, '/')

let YamlReader = await import('../config/yamlreader.js')
YamlReader = YamlReader.default

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
            //群管开关，默认关闭
            GroupManage: false,
            //发言榜榜单上线人数，默认10
            Listlimit: 10,
        }
        fs.writeFileSync(groupPath, yaml.dump(Data), 'utf-8')
    }
    let groupcfg = new YamlReader(pathAddr + '/plugins/group-plugin/data/' + `/${group_id}/` + group_id + '.yaml', true)
    return groupcfg
}

export default { readJsonFile, getGroupYaml }