import mongoose from '../mongoose'
import { getNowDate, randomIndex } from '../utils'
import users_model from './users'
import { getModel } from './playGames/index'


const rooms_Schema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    require: true
  },
  gameType: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'gameTypeRef',
    require: true
  },
  gameTypeRef: {
    type: String,
    required: true,
    enum: ['NanchangeMj']
  },
  roomStart: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    require: true,
    default: '棋牌麻将'
  },
  createUser: {
    type: String,
    ref: 'User'
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createTime: {
    type: String,
    default: getNowDate()
  }
})

rooms_Schema.pre('findOne', function (next) {
  this
    .populate('gameType')
    .populate({
      path: 'players'
    })
  next()
})

rooms_Schema.pre('findOneAndUpdate', function (next) {
  this
    .populate('gameType')
    .populate({
      path: 'players'
    })
  next()
})

rooms_Schema.post('findOneAndRemove', async function(doc) {
  const playModel = getModel(doc.gameTypeRef)
  await playModel.model.deleteOne({ roomId: doc.roomId })
  await playModel.userModel.deleteMany({ roomId: doc.roomId })
  await users_model.updateMany(
      { roomId: doc.roomId },
      { roomId: null }
    )
})

rooms_Schema.pre('save', function (next, options: any) {
  if (options?.someOption) {
    const min = 100000;
    const max = 999999;
    let randomNum = randomIndex(max, min).toString();
    this.roomId = randomNum
    const checkUnique = () => {
      model.findOne({ roomId: randomNum }, (err: any, doc: any) => {
        if (err) {
          throw new Error('创建房间失败80')
        }
        if (doc) { // 如果查出当前roomId有房间则递归
          randomNum = randomIndex(max, min).toString()
          checkUnique();
        } else {
          this.roomId = randomNum
          next();
        }
      });
    }
    checkUnique();
  }
  next()
});

rooms_Schema.virtual('playerInfo', {
  ref: 'User',
  localField: 'roomId',
  foreignField: 'roomId'
})



const model = mongoose.model('Room', rooms_Schema, 'rooms')

export default model