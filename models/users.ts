import mongoose from '../mongoose'
import { getNowDate, randomName } from '../utils/index'
import { ServerInfo } from '../config'

const users_Schema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        default: randomName()
    },
    sign: {
        type: String,
        require: true
    },
    roomId: {
        type: String,
        ref: 'Room',
        default: null
    },
    gameIp: {
        type: String,
        default: ServerInfo.mjSocket
    },
    gems: {
        type: Number,
        default: 5
    },
    roomOnline: {
        type: Boolean,
        default: false
    },
    gold: {
        type: Number,
        default: 10000
    },
    sex: {
        type: Number,
        default: 0,
        enum: [0, 1]
    },
    avatar: {
        type: String,
        default: ServerInfo.defaultAvatar
    },
    createTime: {
        type: String,
        default: getNowDate()
    }
})

export default mongoose.model('User',users_Schema,'users')