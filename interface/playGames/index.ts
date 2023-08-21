
interface mjType {
    type: String,
    number: Number
}

export interface NanChangeMj {
    maxUser: string,
    roomId: string,
    maxGames: string,
    banker: string,
    currentGame: number,
    remainingTiles: Array<mjType>
    stairs: string,
    playMethods: Array<string>,
    rules: Array<string>
    createTime: string
}

export enum operatesModel {
    CHOW = 'Chow',
    PONG = 'Pong',
    KONG = 'Kong',
    WIN = 'Win'
}

export enum HuTypes {
    PINGHU = 'PingHu',
    GERMANY_PINGHU = 'Germany_PingHu',
    SEVENPAIRS = 'SevenPairs',
    GERMANY_SEVENPAIRS = 'Germany_SevenPairs',
    SHISANLAN = 'ShiSanLan',
    GERMANY_SHISANLAN = 'Germany_ShiSanLan',
}
