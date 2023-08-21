import { Socket } from 'socket.io';
import { randomIndex } from '../utils';
import { User, clientSendMsg, clientSendVoice, clientUserReadyInfo, clientSendPlayCard, clientSendVerify, TileMj, TypeVerify } from '../interface';
import { operatesModel, HuTypes } from '../interface/playGames';
import { HuConfig, ChowConfig, PKongConfig, calculateHuScore } from '../utils/Mj/index'
const app = require('express')();
const fs = require('fs')
const path = require('path')
const key_absoluteFilePath = path.resolve(__dirname, '../ssl/aimego/aimego.top.key');
const cert_absoluteFilePath = path.resolve(__dirname, '../ssl/aimego/aimego.top_bundle.crt');
const options = {
    key: fs.readFileSync(key_absoluteFilePath),
    cert: fs.readFileSync(cert_absoluteFilePath)
};

const https = require('https').createServer(options, app)

// const https = require('https').createServer(options, app)
// const https = require('http').createServer(app)

const io = require('socket.io')(https, {
    cors: {
        origins:'*', // from the screenshot you provided
        methods: ["GET", "POST"],
        credentials: true
    }
});


import users_model from '../models/users'
import rooms_model from '../models/rooms'
import mongoose, { ObjectId, SaveOptions } from 'mongoose';
import { PlayGamesModels, getModel } from '../models/playGames'
import { isSorted } from '../utils/Mj/mjHu';


let roomCountDownTimer: NodeJS.Timeout
let debounceTimer: NodeJS.Timeout

interface joinRoomMsg {
    _id: string,
    roomId: string
}

const calculateSeatBank = (step: number, players: Array<mongoose.Types.ObjectId>): mongoose.Types.ObjectId => {
    const index = step % players.length
    return players[index]._id
}

const playerBeforeIndex = (currentId: string, players: Array<mongoose.Types.ObjectId>) => { // 根据自身id获取上家的下标索引号
    const BeforeIndex = players.findIndex(val => val.toString() === currentId) - 1
    if (BeforeIndex < 0) {
        return players.length - 1
    } else {
        return BeforeIndex
    }
}

io.on('connection', (client: Socket) => {
    const userId: string = client.handshake.query.userId as string

    const dealcard = async (roomId: string): Promise<any> => {
        try {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({ roomId })
            const playGameUser_result = await playModel.userModel.find({ roomId: roomId })

            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playGameUser_result) {
                throw new Error('用户不存在该玩法房间')
            }

            await Promise.all(playGameUser_result.map(async (userGame) => {
                userGame.roomHand = new mongoose.Types.DocumentArray(playerGame.remainingTiles.splice(0, 13))
                await userGame.save()
            }))
            // io.to(roomId).emit('remainCard', remainingTiles.length)
            return playerGame.save()
        } catch (err) {
            client.emit('dealcard fail', JSON.stringify(err))
        }
    }

    const clientRound = async (roomId: string, flag: Boolean, timer?: number, draw: boolean = true) => {
        try {
            // if (debounceTimer) clearTimeout(debounceTimer)
            // debounceTimer = setTimeout(async () => {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({ roomId })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            let countdown = timer ? timer : playerGame.countdownTime

            if (roomCountDownTimer) {
                clearInterval(roomCountDownTimer)
            }
            roomCountDownTimer = setInterval(() => {
                io.to(roomId).emit('countdown', countdown--);
                // 如果倒计时时间为0，则清除倒计时并发送倒计时结束事件
                if (countdown < 0) {
                    if (flag) {
                        io.to(roomId).emit('countdownEnd', playerGame.round);
                    } else {
                        clientRound(roomId, true)
                    }
                    return clearInterval(roomCountDownTimer);
                }
            }, 1000);
            if (flag) {
                console.log('clientRound' + playerGame.round)
                io.to(roomId).emit('round success', { roundId: playerGame.round, draw })
            }
        } catch (err) {
            client.emit('round fail', JSON.stringify(err))
        }
    }

    const broadcastVerify = async (msgInfo: clientSendVerify) => { // 检测当前手牌是否构成吃碰杠胡
        const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
        if (!room_result) {
            throw new Error('房间不存在')
        }

        const playModel = getModel(room_result.gameTypeRef)
        const playerGame = await playModel.model.findOne({ roomId: msgInfo.roomId })
        const playGameUser_result = await playModel.userModel.find({ roomId: msgInfo.roomId })
        if (!playerGame) {
            throw new Error('游戏玩法不存在')
        }
        const BeforeIndex = room_result.players.findIndex(val => val.toString() === msgInfo.owner)
        const currentBeforeIndex = playerBeforeIndex(userId, room_result.players)
        const otherUsers_result = playGameUser_result.filter(val => val._id.toString() != userId)
        const otherInfo = otherUsers_result.map(user_result => {
            const hints: Array<operatesModel> = []
            if (HuConfig([...user_result.roomHand as Array<TileMj>, msgInfo.card], playerGame.jokers as Array<TileMj>).isHu) {
                hints.push(operatesModel.WIN)
            }

            if (currentBeforeIndex === BeforeIndex && ChowConfig(user_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card)) {
                hints.push(operatesModel.CHOW)
            }

            if (PKongConfig(user_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card, 2)) {
                hints.push(operatesModel.PONG)
            }
            if (PKongConfig(user_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card, 3)) {
                hints.push(operatesModel.KONG)
            }
            return { _id: user_result.user, hints, verifyInfo: msgInfo }
        })
        return otherInfo
    }

    const SelfVerify = async (msgInfo: clientSendVerify) => { // 检测当前手牌是否构成吃碰杠胡
        const hints: Array<operatesModel> = []
        const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
        if (!room_result) {
            throw new Error('房间不存在')
        }
        const playModel = getModel(room_result.gameTypeRef)
        const playerGame = await playModel.model.findOne({ roomId: msgInfo.roomId })
        const playGameUser_result = await playModel.userModel.findOne({ user: userId })
        if (!playerGame) {
            throw new Error('游戏玩法不存在')
        }
        if (!playGameUser_result) {
            throw new Error('游戏玩法不存在该用户')
        }
        const isHideKong = playGameUser_result.roomHand.filter(val => val.index === msgInfo.card.index).length === 4
        if (HuConfig(playGameUser_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>).isHu) {
            hints.push(operatesModel.WIN)
        }
        if (isHideKong) {
            hints.push(operatesModel.KONG)
        }
        return { _id: playGameUser_result._id, hints, verifyInfo: msgInfo }
    }

    client.on('joinRoom', async (data: joinRoomMsg) => {
        try {
            const isExist = await rooms_model.findOne({ // 检查是否存在房间
                roomId: data.roomId
            })
            if (!isExist) {
                throw new Error('房间不存在')
            }
            client.join(data.roomId)
            await users_model.findOneAndUpdate({ // 更新用户的roomId
                _id: data._id
            }, {
                roomId: data.roomId
            })

            const playModel = getModel(isExist.gameTypeRef)

            // 查询players数组是否存在用户的id
            const player = isExist.players.some(player => player._id.toString() === data._id);
            if (player) { // 用户发生突发情况重连后已存在房间中则直接进入
                return io.to(data.roomId).emit('join success', isExist)
            } else {
                const room = await rooms_model.findOneAndUpdate({ // 将用户添加进房间数据库
                    roomId: data.roomId
                }, {
                    $push: { players: data._id }
                }, {
                    new: true
                })
                const userModel = new playModel.userModel({ // 创建用户玩法中间表
                    user: data._id,
                    roomId: data.roomId
                })
                await userModel.save()
                await playModel.model.findOneAndUpdate({ // 将用户玩法表与玩法表关联
                    roomId: data.roomId
                }, {
                    $push: { players: userModel._id }
                })

                io.to(data.roomId).emit('join success', room)
            }
        }
        catch (err) {
            client.leave(data.roomId)
            client.emit('join fail', '加入房间失败')
        }
    })

    client.on('leaveRoom', async (data: joinRoomMsg) => { // 离开房间
        try {
            await users_model.findOneAndUpdate({ // 将用户的roomId改为null
                _id: data._id
            }, {
                roomId: null,
                roomHand: [],
                roomSite: [],
                roomChow: [],
                roomPong: [],
                roomKong: []
            })

            const room_result = await rooms_model.findOneAndUpdate({ // 删除room表中player数组内信息
                roomId: data.roomId
            }, {
                $pullAll: { players: [data._id] }
            }, {
                new: true
            })

            if (room_result?.players.length === 0) { // 解散房间
                await rooms_model.findOneAndRemove({ roomId: data.roomId })
                io.to(data.roomId).emit('leave success', { _id: data._id, room: room_result })
                client.leave(data.roomId)
                return io.to(data.roomId).emit('dismiss success', '房间已解散')
            }

            if (room_result?.createUser === data._id) { // 如果离开的人是房主则将房主移交给下一个人
                rooms_model.findOneAndUpdate({
                    createUser: data._id
                }, {
                    createUser: room_result?.players[0]._id
                }, {
                    new: true
                })
                room_result.createUser = room_result?.players[0]._id.toString()
            }
            io.to(data.roomId).emit('leave success', { _id: data._id, room: room_result })
            client.leave(data.roomId)
        }
        catch (err) {
            client.emit('leave fail', JSON.stringify(err))
        }
    })

    client.on('dismissRoom', async (data: joinRoomMsg) => { // 解散房间
        try {
            const roomMsg = await rooms_model.findOne({ createUser: data._id })
            if (!roomMsg) {
                throw new Error('该用户没有权限解散房间')
            }
            const socketIds = Object.keys(io.sockets.adpater.room[data.roomId].socket);
            socketIds.forEach(socketId => {
                io.sockets.connected[socketId].level(data.roomId);
            })
            rooms_model.findOneAndRemove({ roomId: data.roomId }, (err: any, doc: any) => {
                if (err) {
                    throw new Error('解散房间失败')
                }
                client.emit('dismiss success', '房间已解散')
            })
        } catch (err) {
            client.emit('dismiss fail', JSON.stringify(err))
        }
    })

    client.on('heartbeart', () => {
        client.emit('heartbeart')
    })

    client.on('startGame', async (roomId: string) => {
        try {
            const room_result = await rooms_model.findOneAndUpdate({
                roomId
            }, {
                roomStart: true
            }, {
                new: true
            })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({
                roomId
            })
            if (!playerGame) {
                throw new Error('玩法不存在')
            }
            await dealcard(roomId)
            if (!(playerGame?.banker)) {
                const diceNumber = randomIndex(6, 1)
                playerGame.banker = calculateSeatBank(diceNumber, room_result.players)
                playerGame.round = playerGame.banker
                await playerGame.save()
            }
            io.to(roomId).emit('startGame success', { banker: playerGame.banker, jokers: playerGame.jokers })
            clientRound(roomId, true) // 开始下一个人的回合
        }
        catch (err) {
            client.emit('startGame fail', JSON.stringify(err))
        }
    })

    client.on('getDealcard', async (roomId: string) => {
        try {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playGameUser_result = await playModel.userModel.findOne({
                user: userId,
                roomId: roomId
            })
            io.to(roomId).emit('getDealcard success', playGameUser_result)
            // client.emit('getDealcard success', playGameUser_result)
        } catch (err) {
            client.emit('getDealcard fail', JSON.stringify(err))
        }
    })

    client.on('banker', async (roomId: string) => {
        try {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }

            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({ roomId })

            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playerGame.banker) { // 如果没有庄就通过投骰子的方式来确定
                const dice1 = randomIndex(6, 1)
                const dice2 = randomIndex(6, 1)
                const dicesNumber = dice1 + dice2
                const bankerId = calculateSeatBank(dicesNumber, room_result.players)
                playerGame.banker = bankerId
                io.to(roomId).emit('dice', { dice1, dice2 })
            }
            playerGame.round = playerGame.banker
            await playerGame.save()
            // 如果有庄则直接返回庄家的id
            client.emit('banker success', { _id: playerGame.banker, jokers: playerGame.jokers })

        } catch (err) {
            client.emit('banker fail', JSON.stringify(err))
        }
    })

    // client.on('dealcard', async (roomId: string) => {
    //     try {
    //         let updatedDoc = true
    //         const room_result = await rooms_model.findOne({ roomId })
    //         if (!room_result) {
    //             throw new Error('房间不存在')
    //         }
    //         let remainingTiles: Array<any> = []
    //         const playModel = getModel(room_result.gameTypeRef)
    //         const playGameUser_result = await playModel.userModel.findOne({ user: userId })
    //         if (!playGameUser_result) {
    //             throw new Error('用户不存在该玩法房间')
    //         }
    //         while (updatedDoc) {  // 使用乐观锁解决并发冲突问题，保存数据时根据版本字段__v来判断是否有人先一步修改了
    //             const playerGame = await playModel.model.findOne({ roomId })
    //             if (!playerGame) {
    //                 throw new Error('游戏玩法不存在')
    //             }
    //             remainingTiles = playerGame.remainingTiles

    //             playGameUser_result.roomHand = new mongoose.Types.DocumentArray(remainingTiles.splice(0, 13))
    //             const result = await playModel.model.findOneAndUpdate({
    //                 roomId,
    //                 __v: playerGame.__v
    //             }, {
    //                 remainingTiles,
    //                 $inc: { __v: 1 }
    //             })
    //             updatedDoc = result === null // 如果为null则查找不到要修改的数据此时循环，直到修改成功
    //         }

    //         await playGameUser_result.save()
    //         io.to(roomId).emit('remainCard', remainingTiles.length) // 返回剩余牌数
    //         io.to(roomId).emit('dealcard success', playGameUser_result)
    //         clientRound(roomId, true) // 开始下一个人的回合
    //     } catch (err) {
    //         client.emit('dealcard fail', JSON.stringify(err))
    //     }
    // })

    client.on('playcard', async (msgInfo: clientSendPlayCard) => { // 出牌
        try {
            const verifyMsg: clientSendVerify = {
                roomId: msgInfo.roomId,
                type: TypeVerify.OTHER,
                owner: userId,
                card: msgInfo.card
            }
            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }

            const userSeatIndex = room_result.players.findIndex(val => val._id.toString() === userId)
            const nextRound = calculateSeatBank((userSeatIndex + 1), room_result.players)
            const playModel = getModel(room_result.gameTypeRef) // 确定房间玩法并给出对应的模型
            await playModel.model.findOneAndUpdate({ roomId: msgInfo.roomId }, { // 放入公共弃牌堆
                $push: { fieldTiles: msgInfo.card },
                round: nextRound // 下一个人
            })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            if (!playGameUser_result) {
                throw new Error('用户不存在该玩法房间')
            }
            const HandCardIndex = playGameUser_result.roomHand.findIndex(val => val.index === msgInfo.card.index)
            playGameUser_result.roomHand.splice(HandCardIndex, 1)
            playGameUser_result.roomSite.push(msgInfo.card)
            await playGameUser_result.save()
            const otherVerifyInfo = await broadcastVerify(verifyMsg)
            if (otherVerifyInfo.filter(val => val.hints.length != 0).length) {
                clientRound(msgInfo.roomId, false, 8)
            } else {
                clientRound(msgInfo.roomId, true)
            }
            io.to(msgInfo.roomId).emit('playcard success', { _id: userId, card: msgInfo.card })
            // io.to(msgInfo.roomId).emit('broadcastVerify', otherVerifyInfo)
            client.broadcast.to(msgInfo.roomId).emit('playcardVerify', otherVerifyInfo) // 除了本客户端，广播通知其他客户端检测当前手牌
        } catch (err) {
            client.emit('playcard fail', JSON.stringify(err))
        }
    })


    client.on('drawcard', async (roomId: string) => {
        // console.log('drawcard'+userId)
        try {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef) // 确定房间玩法并给出对应的模型
            const playerGame = await playModel.model.findOne({ roomId })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }
            if (!playGameUser_result) {
                throw new Error('用户不存在该玩法房间')
            }
            let remainingTiles = playerGame.remainingTiles
            if (playerGame.remainingTiles.length != 0) { // 剩余麻将不为0则可让人摸牌
                const drawhand: TileMj = remainingTiles.splice(0, 1)[0] as TileMj
                const verifyMsg: clientSendVerify = {
                    roomId: roomId,
                    type: TypeVerify.SELF,
                    owner: userId,
                    card: drawhand
                }

                playGameUser_result.roomHand = new mongoose.Types.DocumentArray(isSorted([...playGameUser_result.roomHand as Array<TileMj>, drawhand]))
                playerGame.remainingTiles = remainingTiles
                await playerGame.save()
                await playGameUser_result.save()
                const SelfVerifyInfo = await SelfVerify(verifyMsg)
                io.to(roomId).emit('remainCard', remainingTiles.length)
                io.to(roomId).emit('drawcard success', { _id: userId, card: drawhand })
                client.emit('drawcardVerify', SelfVerifyInfo)
            } else {
                console.log('流局')
                return io.socket(roomId).to('game over')
            }
        } catch (err) {
            client.emit('drawcard fail', JSON.stringify(err))
        }
    })

    client.on('ready', async (msgInfo: clientUserReadyInfo) => {
        try {

            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef) // 确定房间玩法并给出对应的模型
            const playerGame = await playModel.model.findOne({ roomId: msgInfo.roomId })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }
            if (!playGameUser_result) {
                throw new Error('游戏玩法不存在该用户')
            }
            playGameUser_result.roomReady = msgInfo.ready
            await playGameUser_result.save()
            io.to(msgInfo.roomId).emit('ready success', { _id: userId, ready: msgInfo.ready })
        } catch {
            client.emit('ready fail', '准备失败')
        }
    })

    client.on('gameResult', async (roomId: string) => {
        try {
            const room_result = await rooms_model.findOne({ roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playGameUserAll_result = await playModel.userModel.find({ roomId }).populate('user')
            client.emit('gameResult success', playGameUserAll_result)
        } catch (err) {
            client.emit('gameResult fail', err)
        }
    })


    client.on('win', async (msgInfo: clientSendVerify) => {
        try {
            console.log('win'+userId)
            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({ roomId: msgInfo.roomId })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            const playGameUserAll_result = await playModel.userModel.find({ roomId: msgInfo.roomId })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playGameUser_result) {
                throw new Error('游戏玩法不存在该用户')
            }

            const winSuit: Array<TileMj> = msgInfo.type === TypeVerify.SELF ? playGameUser_result.roomHand as Array<TileMj> : [...playGameUser_result.roomHand as Array<TileMj>, msgInfo.card]
            const win = HuConfig(winSuit, playerGame.jokers as Array<TileMj>)
            if (win.isHu) {
                clearInterval(roomCountDownTimer)
                io.to(msgInfo.roomId).emit('countdown', 0);
                const HuScoreConfig = calculateHuScore(win.type, msgInfo.type, playerGame.banker.toString(), userId, msgInfo.owner)
                let countWinValue = 0
                await Promise.all(playGameUserAll_result.map(async (userGame) => {
                    if (userGame.user?.toString() === userId) {
                        // userGame.record.push({ method: msgInfo.type, win: win.type, value: HuScoreConfig.win })
                        // userGame.value += HuScoreConfig.win
                        return userGame
                    } 
                    else if (HuScoreConfig?.banker && userGame.user?.toString() === playerGame.banker.toString()) {
                        userGame.record.push({ method: msgInfo.type, win: win.type, value: HuScoreConfig.banker })
                        userGame.value += HuScoreConfig.banker
                        countWinValue += Math.abs(HuScoreConfig.banker)
                    } else if (HuScoreConfig?.discard && userGame.user?.toString() === msgInfo.owner) {
                        userGame.record.push({ method: msgInfo.type, win: win.type, value: HuScoreConfig.discard })
                        userGame.value += HuScoreConfig.discard
                        countWinValue += Math.abs(HuScoreConfig.discard)
                    } else {
                        userGame.record.push({ method: msgInfo.type, win: win.type, value: HuScoreConfig.other })
                        userGame.value += HuScoreConfig.other
                        countWinValue += Math.abs(HuScoreConfig.other)
                    }
                    await userGame.save()
                }))
                playGameUser_result.record.push({ method: msgInfo.type, win: win.type, value: countWinValue })
                playGameUser_result.value += countWinValue
                await playGameUser_result.save()
                io.to(msgInfo.roomId).emit('win success', { ...msgInfo, _id: userId, huType: win.type, operateType: operatesModel.WIN })
                return io.to(msgInfo.roomId).emit('game over')
            }
        } catch (err) {
            console.log('win', err)
            client.emit('win fail', '胡牌失败')
        }
    })

    client.on('chow', async (msgInfo: clientSendVerify) => {
        try {
            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const currentBeforeIndex = playerBeforeIndex(userId, room_result.players)
            const BeforeIndex = room_result.players.findIndex(val => val.toString() === msgInfo.owner)

            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOne({ roomId: msgInfo.roomId })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            const otherPlayGameUser_result = await playModel.userModel.findOne({ user: msgInfo.owner })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playGameUser_result) {
                throw new Error('玩法不存在该用户')
            }

            if (!otherPlayGameUser_result) {
                throw new Error('被吃玩家不存在')
            }

            const otherSiteCard: TileMj = otherPlayGameUser_result.roomSite[otherPlayGameUser_result.roomSite.length - 1] as TileMj
            const isChow: Array<Array<TileMj>> = ChowConfig(playGameUser_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card)
            if (otherSiteCard.index !== msgInfo.card.index) {
                throw new Error('吃牌错误，被吃的玩家并无此牌')
            }
            if (currentBeforeIndex === BeforeIndex && isChow.length != 0) {
                isChow[0].forEach((val: TileMj) => {
                    const index = playGameUser_result.roomHand.findIndex(v => v.index === val.index)
                    playGameUser_result.roomHand.splice(index, 1)
                })
                playGameUser_result.roomChow.push(new mongoose.Types.DocumentArray([...isChow[0], msgInfo.card]))
                otherPlayGameUser_result.roomSite.pop()
                await playGameUser_result.save()
                await otherPlayGameUser_result.save()
                clientRound(msgInfo.roomId, true, playerGame.countdownTime, false)
                return io.to(msgInfo.roomId).emit('chow success', { ...msgInfo, _id: userId, handArr: isChow[0], operateType: operatesModel.CHOW })
            }
        } catch (err) {
            client.emit('chow fail', '吃牌失败')
        }
    })

    client.on('pong', async (msgInfo: clientSendVerify) => {
        try {
            console.log('pong'+userId)
            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOneAndUpdate({ roomId: msgInfo.roomId }, {
                round: userId
            }, { new: true })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            const otherPlayGameUser_result = await playModel.userModel.findOne({ user: msgInfo.owner })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playGameUser_result) {
                throw new Error('玩法不存在该用户')
            }

            if (!otherPlayGameUser_result) {
                throw new Error('被吃玩家不存在')
            }

            const otherSiteCard: TileMj = otherPlayGameUser_result.roomSite[otherPlayGameUser_result.roomSite.length - 1] as TileMj
            const isPong = PKongConfig(playGameUser_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card, 2)

            if (otherSiteCard.index !== msgInfo.card.index) {
                throw new Error('碰牌错误，被吃的玩家并无此牌')
            }
            if (isPong) {
                const index = playGameUser_result.roomHand.findIndex(v => v.index === msgInfo.card.index)
                const delPong = playGameUser_result.roomHand.splice(index, 2) as Array<TileMj>
                playGameUser_result.roomPong.push(new mongoose.Types.DocumentArray([...delPong, msgInfo.card]))
                otherPlayGameUser_result.roomSite.pop()
                await playGameUser_result.save()
                await otherPlayGameUser_result.save()
                clientRound(msgInfo.roomId, true, playerGame.countdownTime, false)
                io.to(msgInfo.roomId).emit('pong success', { ...msgInfo, _id: userId, handArr: delPong, operateType: operatesModel.PONG })
            }
        } catch (err) {
            console.log('pong', err)
            client.emit('pong fail', '碰牌失败' + err)
        }
    })

    client.on('kong', async (msgInfo: clientSendVerify) => {
        try {
            const room_result = await rooms_model.findOne({ roomId: msgInfo.roomId })
            if (!room_result) {
                throw new Error('房间不存在')
            }
            const playModel = getModel(room_result.gameTypeRef)
            const playerGame = await playModel.model.findOneAndUpdate({ roomId: msgInfo.roomId }, {
                round: userId
            }, { new: true })
            const playGameUser_result = await playModel.userModel.findOne({ user: userId })
            const otherPlayGameUser_result = await playModel.userModel.findOne({ user: msgInfo.owner })
            if (!playerGame) {
                throw new Error('游戏玩法不存在')
            }

            if (!playGameUser_result) {
                throw new Error('玩法不存在该用户')
            }

            if (!otherPlayGameUser_result) {
                throw new Error('被吃玩家不存在')
            }


            const otherSiteCard = otherPlayGameUser_result.roomSite[otherPlayGameUser_result.roomSite.length - 1]
            const isKong = PKongConfig(playGameUser_result.roomHand as Array<TileMj>, playerGame.jokers as Array<TileMj>, msgInfo.card, 3)
            const index = playGameUser_result.roomHand.findIndex(v => v.index === msgInfo.card.index)
            if (isKong) {
                if (msgInfo.type === TypeVerify.SELF) {
                    const delKong = playGameUser_result.roomHand.splice(index, 4) as Array<TileMj>
                    await playGameUser_result.save()
                    clientRound(msgInfo.roomId, true, playerGame.countdownTime, true)
                    return io.to(msgInfo.roomId).emit('kong success', { ...msgInfo, _id: userId, handArr: delKong })
                } else {
                    if (otherSiteCard.index !== msgInfo.card.index) {
                        throw new Error('杠牌错误，被杠的玩家并无此牌')
                    }
                    const delKong = playGameUser_result.roomHand.splice(index, 3) as Array<TileMj>
                    otherPlayGameUser_result.roomSite.pop()
                    await playGameUser_result.save()
                    await otherPlayGameUser_result.save()
                    clientRound(msgInfo.roomId, true, playerGame.countdownTime, true)
                    return io.to(msgInfo.roomId).emit('kong success', { ...msgInfo, _id: userId, handArr: delKong, operateType: operatesModel.KONG })
                }
            }
        } catch (err) {
            console.log('kong', err)
            client.emit('kong fail', '杠牌失败')
        }
    })

    client.on('skip', async (roomId: string) => {
        return clientRound(roomId, true)
    })

    client.on('message', async (msgInfo: clientSendMsg) => {
        try {
            const user = await users_model.findById(userId)
            // 向该房间内的其他用户消息
            io.to(user?.roomId).emit('message success', { _id: userId, msg: msgInfo.msg, sfx: msgInfo.sfx || null })
        } catch (err) {
            client.emit('message fail', '发送信息失败')
        }
    })

    client.on('voice', (msgInfo: clientSendVoice) => {
        console.log(msgInfo.voice)
        io.to(msgInfo.roomId).emit('voice success', { _id: userId, voice: msgInfo.voice })
    })

    client.on('emoji', async (emoji: string) => { // 发送表情
        try {
            const user = await users_model.findById(userId)
            // 向该房间内的其他用户消息
            io.to(user?.roomId).emit('emoji success', { _id: userId, emoji })
        } catch (err) {
            client.emit('emoji fail', '发送表情失败')
        }
    })

    client.on('disconnect', async () => {
        const user = await users_model.findById(userId)
        if (user?.roomId) {
            // 向该房间内的其他用户发送离线通知
            io.to(user.roomId).emit('userOffline', user._id)
        }
        console.log('user disconnected');
    })
})

// http.listen(9001, () => {
//     console.log('listening on *:9001');
// })

https.listen(9001, () => {
    console.log('listening on *:9001');
})