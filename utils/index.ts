
import crypto from 'crypto'
import randomName from './randomName'

const randomIndex = (max:number, min: number) => { // 不包含max
    return Math.floor(Math.random() * (max - min)) + min
}

const CryptoEncodeMD5 = (data: string) => {
    const md5 = crypto.createHash('md5') // 单向加密不可逆(只会生成16字节的结果)
    md5.update(data)
    const result = md5.digest('hex') // 计算加密结果，hex表示输出16进制的加密结果
    return result
}

const findLastIndex = (array: Array<any>, callback: Function) => {
    for (let i = array.length - 1; i >= 0; i--) {
      if (callback(array[i], i, array)) {
        return i;
      }
    }
    return -1;
  }


const getNowDate = () => {
    let date = new Date()
    let year: string | number = date.getFullYear()
    let month: string | number = date.getMonth() + 1
    let day: string | number = date.getDate()
    let hour: string | number = date.getHours()
    let minutes: string | number = date.getMinutes()
    let seconds: string | number = date.getSeconds()
    month = month < 10 ? `0${month}` : month
    day = day < 10 ? `0${day}` : day
    hour = hour < 10 ? `0${hour}` : hour
    minutes = minutes < 10 ? `0${minutes}` : minutes
    seconds = seconds < 10 ? `0${seconds}` : seconds
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`
}

export {
    randomIndex,
    findLastIndex,
    CryptoEncodeMD5,
    getNowDate,
    randomName
}