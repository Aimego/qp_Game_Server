import { Request } from 'express'

interface ErrorMsg {
    code: number,
    message: string
}

interface TileMj { // 麻将类型
    type: string,
    number: string,
    index: number
}

export interface User { // 用户信息格式
    _id: string,
    name: string,
    sign: string,
    roomId: string,
    gameIp: string,
    gems: number,
    roomOnline: boolean,
    gold: number,
    avatar: string,
    sex: number,
    createTime: string
}

class useError extends Error {
    code: number = 500;
    constructor(code: number, message: string) {
        super(message)
        this.code = code
    }
}

interface AuthRequest extends Request {
    auth?: any
}

// 客户端返回的socket消息格式
interface clientSendMsg {
    msg: string,
    sfx?: string
}

// 客户端返回的语音消息格式
interface clientSendVoice {
    roomId: string,
    voice: string
}

// 客户端返回的socket玩家准备格式
interface clientUserReadyInfo {
    roomId: string,
    ready: boolean
}

interface clientSendPlayCard {
    roomId: string,
    card: TileMj
}

enum TypeVerify {
    SELF = 'Self',
    OTHER = 'Other'
}

interface clientSendVerify {
    roomId: string,
    type: TypeVerify,
    owner: string,
    card: TileMj
}


export {
    ErrorMsg,
    useError,
    AuthRequest,
    TypeVerify,
    clientSendMsg,
    clientSendVoice,
    clientUserReadyInfo,
    clientSendPlayCard,
    clientSendVerify,
    TileMj
}