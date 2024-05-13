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

export default { get_wind_level }