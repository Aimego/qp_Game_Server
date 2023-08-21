import { HuTypes } from "../../interface/playGames"

interface WinType {
    type: HuTypes,
    win: number,
    other: number,
    discard?: number,
    banker?: number
}

// interface oneSelfWinType {
//     type: HuTypes,
//     win: number,
//     other: number,
//     discard?: number,
//     banker?: number
// }

/**
 * 
 * @param type 胡类型
 * @param isBanker 是否是庄家
 * @param isDiscardBanker 放炮的人是否是庄家
 * @returns 
 */
const someOneWin = (type: HuTypes, isBanker: Boolean, isDiscardBanker: Boolean): WinType => {
    let WinConfig: WinType
    switch (type) {
        case HuTypes.PINGHU:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.PINGHU,
                    win: 8,
                    discard: -4,
                    other: -2
                }
            } else {
                if (isDiscardBanker) { // 闲捉庄
                    WinConfig = {
                        type: HuTypes.PINGHU,
                        win: 6,
                        discard: -4,
                        other: -1
                    }
                } else { // 闲捉闲
                    WinConfig = {
                        type: HuTypes.PINGHU,
                        win: 5,
                        banker: -2,
                        discard: -2,
                        other: -1
                    }
                }
            }
            break;
        case HuTypes.GERMANY_PINGHU:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.GERMANY_PINGHU,
                    win: 21,
                    discard: -13,
                    other: -4
                }
            } else {
                if (isDiscardBanker) {
                    WinConfig = {
                        type: HuTypes.GERMANY_PINGHU,
                        win: 17,
                        discard: -13,
                        other: -2
                    }
                } else {
                    WinConfig = {
                        type: HuTypes.GERMANY_PINGHU,
                        win: 15,
                        banker: -4,
                        discard: -9,
                        other: -2
                    }
                }
            }
            break;
        case HuTypes.SEVENPAIRS:
        case HuTypes.SHISANLAN:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.SHISANLAN,
                    win: 16,
                    discard: -8,
                    other: -4
                }
            } else {
                if (isDiscardBanker) {
                    WinConfig = {
                        type: HuTypes.SHISANLAN,
                        win: 12,
                        discard: -8,
                        other: -2
                    }
                } else {
                    WinConfig = {
                        type: HuTypes.SHISANLAN,
                        win: 10,
                        banker: -4,
                        discard: -4,
                        other: -2
                    }
                }
            }
            break;
        default:
            if (isBanker) { // 庄收子
                WinConfig = {
                    type: HuTypes.GERMANY_SEVENPAIRS,
                    win: 37,
                    discard: -21,
                    other: -8
                }
            } else { // 闲收子
                if (isDiscardBanker) {
                    WinConfig = {
                        type: HuTypes.GERMANY_SEVENPAIRS,
                        win: 29,
                        discard: -21,
                        other: -4
                    }
                } else {
                    WinConfig = {
                        type: HuTypes.GERMANY_SEVENPAIRS,
                        win: 24,
                        banker: -8,
                        discard: -13,
                        other: -4
                    }
                }
            }
    }
    return WinConfig
}


/**
 * 
 * @param type 胡的类型
 * @param isBanker 是否是庄家
 */
const oneSelfWin = (type: HuTypes, isBanker: Boolean): WinType => {
    let WinConfig: WinType
    switch (type) {
        case HuTypes.PINGHU:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.PINGHU,
                    win: 12,
                    other: -4
                }
            } else {
                WinConfig = {
                    type: HuTypes.PINGHU,
                    win: 8,
                    banker: -4,
                    other: -2
                }
            }
            break;
        case HuTypes.GERMANY_PINGHU:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.GERMANY_PINGHU,
                    win: 39,
                    other: -13
                }
            } else {
                WinConfig = {
                    type: HuTypes.GERMANY_PINGHU,
                    win: 31,
                    banker: -13,
                    other: -9
                }
            }
            break;
        case HuTypes.SEVENPAIRS:
        case HuTypes.SHISANLAN:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.SEVENPAIRS,
                    win: 24,
                    other: -8
                }
            } else {
                WinConfig = {
                    type: HuTypes.SEVENPAIRS,
                    win: 16,
                    banker: -8,
                    other: -4
                }
            }
            break;
        // case HuTypes.GERMANY_SEVENPAIRS:
        // case HuTypes.GERMANY_SHISANLAN:
        default:
            if (isBanker) {
                WinConfig = {
                    type: HuTypes.GERMANY_SEVENPAIRS,
                    win: 63,
                    other: -21
                }
            } else {
                WinConfig = {
                    type: HuTypes.GERMANY_SEVENPAIRS,
                    win: 47,
                    banker: -21,
                    other: 13
                }
            }
    }
    return WinConfig
}

export {
    WinType,
    someOneWin,
    oneSelfWin
}