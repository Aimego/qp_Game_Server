import express, { Response, NextFunction, response } from 'express'
import { AuthRequest, useError } from '../interface/index'
import users_model from '../models/users'
import rooms_model from '../models/rooms'
import { getModel } from '../models/playGames'
import { SaveOptions } from 'mongoose'
const router = express.Router()

const options = { someOption: true }; // 传入创建房间的pre钩子自定义参数，用于判断是否创建roomId唯一值

router.post('/createRoom', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.auth
        console.log('createRoom', _id)
        const { gameType } = req.body // 玩法类型
        const player = await users_model.findOne({ _id })
        if (player?.roomId) {
            throw '该用户已存在于其他房间'
        }
        const playModel = getModel(gameType) // 确定房间玩法并给出对应的模型
        const gamesType = new playModel.model({
            ...req.body
        })
        const room = new rooms_model({
            gameType: gamesType._id,
            createUser: _id,
            gameTypeRef: gameType
        })
        room.save(options as SaveOptions, async (err: any, doc: any) => {
            if (err) {
                console.log(err)
                throw '创建房间失败'
            }
            gamesType.roomId = doc.roomId
            await gamesType.save(options as SaveOptions)
            res.send({ code: 200, data: doc })
        })
    } catch (err: any){
        const error = new useError(500, err)
        return next(error)
    }
})


export default router