function getFileSize(size, isByte = true, isSuffix = true) { // 把字节转换成正常文件大小
    if (size == null || size == undefined) return 0
    let num = 1024.00 // byte
    if (isByte && size < num) {
        return size.toFixed(2) + 'B'
    }
    if (size < Math.pow(num, 2)) {
        return (size / num).toFixed(2) + `K${isSuffix ? 'b' : ''}`
    } // kb
    if (size < Math.pow(num, 3)) {
        return (size / Math.pow(num, 2)).toFixed(2) + `M${isSuffix ? 'b' : ''}`
    } // M
    if (size < Math.pow(num, 4)) {
        return (size / Math.pow(num, 3)).toFixed(2) + 'G'
    } // G
    return (size / Math.pow(num, 4)).toFixed(2) + 'T' // T
}

function formatTime(time, format, repair = true) {
    const second = parseInt(time % 60)
    const minute = parseInt((time / 60) % 60)
    const hour = parseInt((time / (60 * 60)) % 24)
    const day = parseInt(time / (24 * 60 * 60))
    const timeObj = {
        day,
        hour: repair && hour < 10 ? `0${hour}` : hour,
        minute: repair && minute < 10 ? `0${minute}` : minute,
        second: repair && second < 10 ? `0${second}` : second
    }
    if (format == 'default') {
        let result = ''

        if (day > 0) {
            result += `${day}天`
        }
        if (hour > 0) {
            result += `${timeObj.hour}小时`
        }
        if (minute > 0) {
            result += `${timeObj.minute}分`
        }
        if (second > 0) {
            result += `${timeObj.second}秒`
        }
        return result
    }

    if (typeof format === 'string') {
        format = format
            .replace(/dd/g, day)
            .replace(/hh/g, timeObj.hour)
            .replace(/mm/g, timeObj.minute)
            .replace(/ss/g, timeObj.second)

        return format
    }

    if (typeof format === 'function') {
        return format(timeObj)
    }

    return timeObj
}

export default { getFileSize, formatTime }