
import { TileMj } from '../../interface'
import { randomIndex } from '../index'
// 初始化麻将的类型和数字
const characterArr: Array<TileMj> = [
    { 'type': 'character', 'number': '1', 'index': 0 },
    { 'type': 'character', 'number': '2', 'index': 1 },
    { 'type': 'character', 'number': '3', 'index': 2 },
    { 'type': 'character', 'number': '4', 'index': 3 },
    { 'type': 'character', 'number': '5', 'index': 4 },
    { 'type': 'character', 'number': '6', 'index': 5 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
]
const bambooArr: Array<TileMj> = [
    { 'type': 'bamboo', 'number': '1', 'index': 18 },
    { 'type': 'bamboo', 'number': '2', 'index': 19 },
    { 'type': 'bamboo', 'number': '3', 'index': 20 },
    { 'type': 'bamboo', 'number': '4', 'index': 21 },
    { 'type': 'bamboo', 'number': '5', 'index': 22 },
    { 'type': 'bamboo', 'number': '6', 'index': 23 },
    { 'type': 'bamboo', 'number': '7', 'index': 24 },
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'bamboo', 'number': '9', 'index': 26 },
]
const dotArr: Array<TileMj> = [
    { 'type': 'dot', 'number': '1', 'index': 36 },
    { 'type': 'dot', 'number': '2', 'index': 37 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '4', 'index': 39 },
    { 'type': 'dot', 'number': '5', 'index': 40 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '7', 'index': 42 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'dot', 'number': '9', 'index': 44 },
]
const windArr: Array<TileMj> = [
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'south', 'index': 55 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'north', 'index': 57 },
]
const colorArr: Array<TileMj> = [
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
]

export const originalList: Array<TileMj> = [ // 每种牌类型
    ...characterArr,
    ...bambooArr,
    ...dotArr,
    ...windArr,
    ...colorArr
]

export const nextTiles = (Index: number, step: number): TileMj => {
    const currentIndex = originalList.findIndex(val => val.index === Index)
    if(currentIndex + step >= originalList.length) {
        return originalList[currentIndex]
    }
    const nextCurrent = originalList[currentIndex + step]
    if(originalList[currentIndex].type === nextCurrent.type) {
        return nextCurrent
    }
    return originalList[currentIndex]
}

export const backTiles = (Index: number, step: number): TileMj => {
    const currentIndex = originalList.findIndex(val => val.index === Index)
    if(currentIndex - step < 0) {
        return originalList[currentIndex]
    }
    const backCurrent = originalList[currentIndex - step]
    if(originalList[currentIndex].type === backCurrent.type) {
        return backCurrent
    }
    return originalList[currentIndex]
}


const allTiles: Array<TileMj> = [] // 总牌数

originalList.forEach((val: TileMj) => {
    for (let i = 0; i < 4; i++) {
        allTiles.push(val)
    }
})

const shuffleArray = (): Array<TileMj> => {
    return allTiles.slice().sort(() => Math.random() - 0.5);
}

const nextJoker = (currentTileMj: TileMj): TileMj => {
    const currentTileIndex = originalList.findIndex((val: TileMj) => val.index === currentTileMj.index)
    if (currentTileIndex + 1 < originalList.length && originalList[currentTileIndex + 1].type === currentTileMj.type) {
        return originalList[currentTileIndex + 1]
    }
    switch (currentTileMj.type) {
        case 'character':
            return characterArr[0]
        case 'bamboo':
            return bambooArr[0]
        case 'dot':
            return dotArr[0]
        case 'wind':
            return windArr[0]
        default:
            return colorArr[0]
    }
}

const shufflejokers = (): Array<TileMj> => {
    const jokers: Array<TileMj> = []
    const shufferIndex = randomIndex(originalList.length, 0)
    const startJoker = originalList[shufferIndex]
    jokers.push(startJoker)
    jokers.push(nextJoker(startJoker))
    return jokers
}

export {
    shuffleArray,
    shufflejokers
}
