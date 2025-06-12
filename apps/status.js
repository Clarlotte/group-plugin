/*
 * @Author: Clarlotte
 * @Date: 2024-12-22 15:21:47
 * @LastEditors: Clarlotte
 * @LastEditTime: 2025-06-12 13:26:05
 * @FilePath: /root/Yunzai/plugins/group-plugin/apps/status.js
 * @Descripttion: 
 */
import systemInformation, { cpu } from 'systeminformation'
import common from '../common/common.js'
import status from '../models/status.js'
import puppeteer from "puppeteer";
import path from 'path'
import os from 'os'

export class systemStatus extends plugin {

    dirPath = path.resolve('./plugins/group-plugin/data')
    constructor() {
        super({
            name: '系统状态',
            dsc: '系统状态',
            event: 'message',
            priority: -1,
            rule: [
                {
                    reg: `.status$`,
                    fnc: 'systemStatus',
                },
            ]
        })
    }

    async systemStatus(e) {
        let groupcfg = common.getGroupYaml(this.dirPath, e.group_id)
        if (!groupcfg.get('GroupManage')) {
            e.reply('该群群管功能未开启，请发送开启群管启用该群的群管功能')
            return false
        }
        const cpus = os.cpus();
        let CPUinfo
        const info = await systemInformation.get({
            currentLoad: 'currentLoad',
            cpu: 'manufacturer, brand, speed, cores, physicalCores',
            mem: 'total, free,available',
            osInfo: 'platform, distro, release'
        })
        if (cpus.length === 0)
            CPUinfo = `未获取到CPU信息`
        else
            CPUinfo = cpus[0].model
        //内存使用率
        let MemUsage = ((1 - info.mem.available / info.mem.total) * 100).toFixed(2) + "%";
        // 总共内存
        let totalmem = await status.getFileSize(info.mem.total)
        // 使用内存
        let Usingmemory = await status.getFileSize((info.mem.total - info.mem.available))
        //CPU使用率
        let CPUsage = Math.round(info.currentLoad.currentLoad) + '%'
        //系统版本信息
        let SystemInfo = info.osInfo.distro + ' ' + info.osInfo.release
        //系统运行时间
        let systime = await status.formatTime(os.uptime(), 'dd天hh小时mm分', false)
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-gpu", "--disable-setuid-sandbox", "--no-sandbox", "--no-zygote"],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 500, height: 365 });
        await page.setContent(`
        <!DOCTYPE html>
        <html lang="zh_CN">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            <style>
                *{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    min-height: 100vh;
                    background-image: url('https://s2.loli.net/2024/04/23/Urh1jcsCIP6XHRS.jpg');
                    background-size: cover;
                    background-repeat: no-repeat;
                    display: flex;
                    font-family: "Douyin Sans";
                }

                .rounded-box {
                    margin: 10px;
                    width: 500px;
                    height: 345px;
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
        
                .usage {
                    width: 90%;
                    max-width: 600px;
                    padding: 0 20px;
                }
        
                .name {
                    font-size: 20px;
                    font-weight: 700;
                    color: #f1f1f1;
                    text-transform: uppercase;
                    margin: 10px 0;
                }
        
                .name-per {
                    height: 14px;
                    background: #36d17c;
                    border-radius: 3px;
                    position: relative;
                }
        
                .name-per::after {
                    border: 20px;
                    content: attr(per);
                    position: absolute;
                    padding: 4px 6px;
                    background: #f1f1f1;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    top: -5px;
                    right: -25px;
                    transform: translateX(50%);
                }
        
                .info {
                    margin-top: 5px;
                    margin-left: 20px;
                    width: 440px;
                    height: 125px;
                    background-color: rgba(0, 0, 20, 0.6);
                    border-radius: 20px;
                    backdrop-filter: blur(5px);
                    position: relative;
                    top: 10px;
                    color: #fff;
                    padding-left: 10px;
                    margin-bottom: 10px;
                }
        
                .systemInfo{
                    padding: 5px 0;
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
                <div class="title">系统信息</div>
                <div class="usage">
                    <div class="name">CPU使用率</div>
                    <div class="name-per" per="${CPUsage}" style="max-width: ${CPUsage}"></div>
                </div>
                <div class="usage">
                    <div class="name">内存使用率(${Usingmemory}/${totalmem})</div>
                    <div class="name-per" per="${MemUsage}" style="max-width: ${MemUsage}"></div>
                </div>
                <div class="info">
                    <div class="systemInfo">CPU：${CPUinfo}</div>
                    <div class="systemInfo">System：${SystemInfo}</div>
                    <div class="systemInfo">Bot已运行：${Bot.getTimeDiff()}</div>
                    <div class="systemInfo">系统已运行：${systime}</div>
                </div>
                <div class="description"><em>Create By TRSS-Yunzai & Group-Plugin</em></div>
            </div>
        </body>
        
        </html>
        `)
        await page.screenshot({ path: this.dirPath + `/status.png`, clip: { x: 0, y: 0, width: 500, height: 365 } });
        await browser.close();
        e.reply(segment.image(this.dirPath + `/status.png`));
        return true
    }
}