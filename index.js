import fs from 'node:fs'
import path from 'path'

const files = fs.readdirSync('./plugins/group-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status != 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

const config_default_path = path.resolve('./plugins/group-plugin/config/config_default.js')
if (!fs.existsSync(config_default_path)) {
  logger.error(`${logger.red('默认设置文件不存在，请检查或重新安装插件')}`)
}
const config_path = path.resolve(`./plugins/group-plugin/config/config/config.js`)
if (!fs.existsSync(config_path))
  fs.copyFileSync(config_default_path, config_path)

logger.mark('-----------------')
logger.mark('groupSetting载入完毕')

export { apps }