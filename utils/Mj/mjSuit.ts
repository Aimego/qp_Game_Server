import { TileMj } from "../../interface"
import { originalList, nextTiles, backTiles } from './mjAllTiles'
import { isClosed, isSorted, isTypes, isShiSanLan, isWinningPingHuHand, isWinningShiSanLanHand, isWindStep } from './mjHu'

export const PinghuSuit = (hand: Array<TileMj>, jokers: Array<TileMj>) => { // 有癞子的情况下都会调用该函数，如果能听牌则会返回可听牌的数组，如果能胡则返回true
    let jokerCount = jokers.length
    if (isWinningPingHuHand(hand, jokerCount)) {
        return true
    }
    const distinguishType: Array<Array<TileMj>> = isTypes(hand)
    let cloneDis: Array<Array<TileMj>> = JSON.parse(JSON.stringify(distinguishType))
    for (let i = 0; i < distinguishType.length; i++) {
        for (let j = 0; j < distinguishType[i].length && jokerCount != 0; j++) {
            if (distinguishType[i].length > 1 && (isClosed(distinguishType[i], 1) || isClosed(distinguishType[i], 2) || isWindStep(distinguishType[i]))) {
                const backMj = backTiles(cloneDis[i][j].index, 1)
                const nextMj = nextTiles(cloneDis[i][j].index, 1)
                const backMjComb = isSorted([...cloneDis[i], backMj])
                const nextMjComb = isSorted([...cloneDis[i], nextMj])
                if (isClosed(backMjComb, 1) || isWindStep(backMjComb)) {
                    cloneDis[i].push(backMj) // 每次push后都break校验赖子是否为0，如果为0则校验该排序是否能胡，如果不能胡就重置
                    jokerCount--
                    break;
                }
                else if (isClosed(nextMjComb, 1) || isWindStep(nextMjComb)) {
                    cloneDis[i].push(nextMj)
                    jokerCount--
                    break;
                } else {
                    continue;
                }
            } else {
                cloneDis[i].push(distinguishType[i][j])
                jokerCount--
                break;
            }
        }
        if (jokerCount === 0) {
            if (isWinningPingHuHand(isSorted(cloneDis.flat()), 0)) {
                return true
            } else {
                jokerCount = jokers.length
                cloneDis = JSON.parse(JSON.stringify(distinguishType))
            }
        }
    }
    return isWinningPingHuHand(isSorted(cloneDis.flat()), jokerCount)
}


export const SevenPairsSuit = (hand: Array<TileMj>, jokers: Array<TileMj>) => {
    if (hand.length <= jokers.length) {
        return true
    }
    return false
}



export const ShiSanLanSuit = (hand: Array<TileMj>, jokers: Array<TileMj>) => {
    let jokerCount = jokers.length
    const distinguishType: Array<Array<TileMj>> = isTypes(hand)
    let cloneDis: Array<Array<TileMj>> = JSON.parse(JSON.stringify(distinguishType))
    for (let i = 0; i < distinguishType.length; i++) {
        for (let j = 0; j < cloneDis[i].length; j++) {
            const step = ['character', 'bamboo', 'dot'].includes(cloneDis[i][j].type) ? 3 : 1
            const backMj = backTiles(cloneDis[i][j].index, step)
            const nextMj = nextTiles(cloneDis[i][j].index, step)
            if (isShiSanLan(isSorted([...cloneDis[i], backMj]))) {
                cloneDis[i].push(backMj)
                jokerCount--
            } else if (isShiSanLan(isSorted([...cloneDis[i], nextMj]))) {
                cloneDis[i].push(nextMj)
                jokerCount--
            } else {
                continue;
            }
            if (jokerCount === 0) {
                return isWinningShiSanLanHand(cloneDis.flat(), jokerCount)
            }
        }
    }
    return isWinningShiSanLanHand(cloneDis.flat(), jokerCount)
}