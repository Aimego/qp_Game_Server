import mongoose from '../../mongoose'
import { shuffleArray, shufflejokers } from '../../utils/Mj/mjAllTiles'

const tileSchema = new mongoose.Schema({
    type: {
        type: String,
        require: true
    },
    number: {
        type: String,
        require: true
    },
    index: {
        type: Number,
        require: true
    }
}, { _id: false })

const WinRecord = new mongoose.Schema({
    method: {
        type: String,
        require: true,
    },
    win: {
       type: String,
       require: true 
    },
    value: {
        type: Number,
        require: true
    }
}, {
    _id: false
})

const NanchangeMj_User = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    roomId: {
        type: String,
        require: true
    },
    roomReady: {
        type: Boolean,
        default: false
    },
    roomHand: {
        type: [tileSchema],
        default: []
    },
    roomSite: {
        type: [tileSchema],
        default: []
    },
    roomChow: {
        type: [[tileSchema]],
        default: []
    },
    roomPong: {
        type: [[tileSchema]],
        default: []
    },
    roomKong: {
        type: [[tileSchema]],
        default: []
    },
    record: {
        type: [WinRecord],
        default: []
    },
    value: {
        type: Number,
        default: 0
    }
})

const pg_Nanchang_mahjong_Schema = new mongoose.Schema({
    maxUser: {
        type: Number,
        default: 4
    },
    countdownTime: {
        type: Number,
        default: 15
    },
    roomId: {
        type: String,
        ref: 'Room'
    },
    banker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NanchangeMjUser'
    }],
    currentGame: {
        type: Number,
        default: 0
    },
    remainingTiles: {
        type: [tileSchema],
        require: true
    },
    jokers: {
        type: [tileSchema],
        require: true
    },
    fieldTiles: {
        type: [tileSchema]
    },
    round: { // 从谁开始轮询
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    maxGames: {
        type: Number,
        default: 8
    },
    stairs: {
        type: String,
    },
    playMethods: {
        type: Array
    },
    rules: {
        type: Array
    }
})

pg_Nanchang_mahjong_Schema.pre('save', function (next, options: any) {
    if (options?.someOption) {
        // 重置remainTiles的牌数
        this.remainingTiles = new mongoose.Types.DocumentArray(shuffleArray())
        this.jokers = new mongoose.Types.DocumentArray(shufflejokers())
    }
    next()
})

const NanChangeMj_Model = mongoose.model('NanchangeMj', pg_Nanchang_mahjong_Schema, 'nanchangeMjs')
const NanchangeMj_UserModel =mongoose.model('NanchangeMjUser', NanchangeMj_User, 'nanchangeMjUsers')

export {
    NanChangeMj_Model,
    NanchangeMj_UserModel
}