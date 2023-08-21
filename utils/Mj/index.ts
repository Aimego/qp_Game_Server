import { TileMj, TypeVerify, User } from "../../interface"
import { HuTypes } from '../../interface/playGames/index'
import { isSevenPairs, isPingHu, isShiSanLan, isSorted, isClosed } from './mjHu'
import { PinghuSuit, SevenPairsSuit, ShiSanLanSuit } from './mjSuit'
import { WinType, someOneWin, oneSelfWin } from './mjScore'

interface remainHandObj {
    type: string,
        hand: Array<TileMj>
}

interface noJokerHandlerType {
    noJoker: Array<TileMj>,
    handJoker: Array<TileMj>
}

const noJokerHandler = (allHand: Array<TileMj>, jokers: Array<TileMj>): noJokerHandlerType => {
    const rankHand = isSorted(allHand)
    const handJoker: Array<TileMj> = []
    const noJoker: Array<TileMj> = rankHand.filter((val: TileMj) => { // 将手牌中的癞子分离
        if (jokers.some(joker => joker.index === val.index)) {
            handJoker.push(val)
            return false
        }
        return true
    })
    return {
        noJoker,
        handJoker
    }
}

const mostHuHandler = (noJoker: Array<TileMj>, maxHand: number): remainHandObj => {
    let remainHand: Array<remainHandObj> = []
    if (maxHand < 14) {
        remainHand.push({
            type: 'PingHu',
            hand: isPingHu(noJoker)
        })
    } else {
        let shisanlan = isShiSanLan(noJoker)
        remainHand.push({
            type: 'PingHu',
            hand: isPingHu(noJoker)
        })
        remainHand.push({
            type: 'SevenPairs',
            hand: isSevenPairs(noJoker)
        })
        if (shisanlan) {
            remainHand.push({
                type: 'ShiSanLan',
                hand: shisanlan as Array<TileMj>
            })
        }
    }


    const minRemainHand = remainHand.reduce((min: remainHandObj, current: remainHandObj): remainHandObj => {
        if (current.hand.length < min.hand.length) {
            return current
        } else {
            return min
        }
    })

    return minRemainHand
}

const fixedSuit = (remain: remainHandObj, jokers: Array<TileMj>): { type: HuTypes, isHu: Boolean } => {
    switch (remain.type) {
        case 'PingHu':
            return {
                type: jokers.length ? HuTypes.PINGHU : HuTypes.GERMANY_PINGHU,
                isHu: PinghuSuit(remain.hand, jokers)
            }
        case 'SevenPairs':
            return {
                type: jokers.length ? HuTypes.SEVENPAIRS : HuTypes.GERMANY_SEVENPAIRS,
                isHu: SevenPairsSuit(remain.hand, jokers)
            }
        default:
            return {
                type: jokers.length ? HuTypes.SHISANLAN : HuTypes.GERMANY_SHISANLAN,
                isHu: ShiSanLanSuit(remain.hand, jokers)
            }
    }
}

export const HuConfig = (allHand: Array<TileMj>, jokers: Array<TileMj>): { type: HuTypes, isHu: Boolean } => {
    const { noJoker, handJoker } = noJokerHandler(allHand, jokers)
    const RemainHand: remainHandObj = mostHuHandler(noJoker, allHand.length)
    return fixedSuit(RemainHand, handJoker)
}

export const ChowConfig = (allHand: Array<TileMj>, jokers: Array<TileMj>, otherCard: TileMj): Array<Array<TileMj>> => {
    const eatHand: Array<Array<TileMj>> = []
    const { noJoker } = noJokerHandler(allHand, jokers)
    const otherTypeHand = noJoker.filter((val: TileMj) => val.type === otherCard.type)
    if (otherTypeHand.length < 2) {
        return eatHand
    }
    for (let i = 0; i < otherTypeHand.length - 1; i++) {
        const sliceOrigin = otherTypeHand.slice(i, i + 2)
        const sliceRankHand = isSorted([...sliceOrigin, otherCard])
        if (isClosed(sliceRankHand, 1)) {
            eatHand.push(sliceOrigin)
        }
    }
    if (eatHand.length === 0) {
        return eatHand
    }
    return eatHand
}


export const PKongConfig = (allHand: Array<TileMj>, jokers: Array<TileMj>, otherCard: TileMj, someLength: number): Boolean => {
    const { noJoker } = noJokerHandler(allHand, jokers)
    const otherSomeHand = noJoker.filter((val: TileMj) => val.index === otherCard.index)
    if (otherSomeHand.length < someLength) { // 不小于2则表明可以碰，不小于3则表明可以杠
        return false
    }
    return true
}

/**
 * 
 * @param type 胡类型
 * @param mode 胡牌方式
 * @param isBanker 庄id
 * @param isWin 胡牌id
 * @param owner 放炮id
 */
export const calculateHuScore = (type: HuTypes, mode: TypeVerify, Banker: string, Win: string, owner: string): WinType => {
    const isBanker: Boolean = Banker === Win
    if (mode === TypeVerify.OTHER) {
        const isDiscardBanker: Boolean = Banker === owner
        return someOneWin(type, isBanker, isDiscardBanker)
    } else {
        return oneSelfWin(type, isBanker)
    }
}
