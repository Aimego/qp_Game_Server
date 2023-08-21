import { TileMj } from '../../interface'

type CountList = {
  [key: number]: number;
}

type TypeList = {
  [key: string]: Array<TileMj>;
}

/**
 * 
 * @param hand 手牌
 * @param step 步数
 * @returns 是否满足step连续
 */

export const isClosed = (hand: Array<TileMj>, step: number) => {
  for (let i = 0; i < hand.length - 1; i++) {
    if (hand[i].index + step !== hand[i + 1].index) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param hand 手牌
 * @param step 步数
 * @returns 是否满足step间隔
 */
export const isSegmentation = (hand: Array<TileMj>, step: number) => {
  for (let i = 0; i < hand.length - 1; i++) {
    if (hand[i].index + step > hand[i + 1].index) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param hand 手牌
 * @returns hand排序
 */

export const isSorted = (hand: Array<TileMj>) => {
  const cloneHand = hand.slice()
  cloneHand.sort((a: TileMj, b: TileMj) => {
    return a.index - b.index
  })
  return cloneHand
}

export const isWindStep = (hand: Array<TileMj>) => {
  if(hand.every(val => val.type === 'wind')) { // 确保该数组中type都是wind
    for (let i = 0; i < hand.length - 1; i++) {
      if (!(hand[i].index + 1 == hand[i + 1].index || hand[i].index + 2 == hand[i + 1].index || hand[i].index + 3 == hand[i + 1].index)) {
        return false;
      }
    }
    return true;
  }
  return false
}


/**
 * 
 * @param hand 手牌
 * @returns hand去重
 */

export const isOnlyOne = (hand: Array<TileMj>) => {
  return hand.filter((vals: TileMj, index: number) => {
    if (hand.findIndex(val => val.index === vals.index) !== index) {
      return false
    }
    return true
  })
}


/**
 * 
 * @param hand 手牌
 * @returns hand花色区分[['万'], ['条] ....]
 */

export const isTypes = (hand: Array<TileMj>) => { // 麻将手牌类型区分
  const cardTypeList: TypeList = {}
  for (let i = 0; i < hand.length; i++) {
    if (cardTypeList[hand[i].type]) {
      cardTypeList[hand[i].type].push(hand[i])
    } else {
      cardTypeList[hand[i].type] = [hand[i]]
    }
  }
  return Object.values(cardTypeList)
}

// 判断是否为平胡的基本条件(必须是22)
export const isWinningPingHuHand = (hand: Array<TileMj>, jokersCount: number) => {
  const remain = isPingHu(hand)
  if(remain.length <= jokersCount) {
    return true
  }
  if (remain.length !== 2) {
    return false
  }
  for (let i = 0; i < remain.length - 1; i++) {
    if (remain[i].index === remain[i + 1].index) {
      return true
    }
  }
  return false
}

export const isWinningShiSanLanHand = (hand: Array<TileMj>, jokersCount: number) => {
  return hand.length + jokersCount >= 5
}


export const isSevenPairs = (hand: Array<TileMj>): Array<TileMj> => {
  const cardCounts: CountList = {};
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i]
    cardCounts[card.index] = (cardCounts[card.index] || 0) + 1
  }
  let cloneHand = hand.slice()
  for (let i = 0; i < cloneHand.length; i++) {
    const card = cloneHand[i]
    if (cardCounts[card.index] % 2 === 0) {
      cloneHand.splice(i, 1)
      i--
    }
  }
  return cloneHand
}


export const isPingHu = (hand: Array<TileMj>): Array<TileMj> => {
  for (let i = 0; i < hand.length - 2; i++) {
    const isGroup = hand.slice(i, i + 6)
    if (isGroup.length === 6) {
      // if(hand.length >= 6) {
      const indexSum = hand[i].index + hand[i + 1].index
      if ((hand[i].index === indexSum / 2) && (hand[i + 2].index === (indexSum / 2) + 1) && (hand[i + 4].index === (indexSum / 2) + 2)) { // 667788
        let cloneHand = hand.slice();
        cloneHand.splice(i, 6);
        return isPingHu(cloneHand)
      }
      if (isGroup.every(val => val.type == 'wind') && hand[i] === hand[i + 1] && hand[i + 2] === hand[i + 3] && hand[i + 4] === hand[i + 5]) {
        let cloneHand = hand.slice();
        cloneHand.splice(i, 6);
        return isPingHu(cloneHand)
      }
    }

    if (hand.length > 3) {
      const isGroup = hand.slice(i, i + 3)
      if (hand[i].index + 1 === hand[i + 1].index && hand[i + 1].index + 1 === hand[i + 2].index) { // 678
        let cloneHand = hand.slice();
        cloneHand.splice(i, 3);
        return isPingHu(cloneHand)
      }

      if (isGroup.every(val => val.type == 'wind') && hand[i].index !== hand[i + 1].index && hand[i + 1].index !== hand[i + 2].index) { // 东南西北只要类型相同，index可以不连续
        let cloneHand = hand.slice();
        cloneHand.splice(i, 3);
        return isPingHu(cloneHand)
      }
    }
  }

  for (let j = 0; j < hand.length - 2; j++) {
    if (hand[j].index === hand[j + 1].index && hand[j + 1].index === hand[j + 2].index) { // 666
      let cloneHand = hand.slice();
      cloneHand.splice(j, 3);

      return isPingHu(cloneHand)
    }
  }
  return hand;
}



export const isShiSanLan = (hand: Array<TileMj>): Boolean | Array<TileMj> => {
  const remain: Array<Array<TileMj>> = []
  if (isOnlyOne(hand).length < hand.length) { // 如果当前手牌（无精）中存在重复的牌组，那么不可能胡十三烂
    return false
  }
  const Types = isTypes(hand)
  for (let i = 0; i < Types.length; i++) {
    if (Types[i].some(val => ['character', 'bamboo', 'dot'].includes(val.type))) { // 把'character', 'bamboo', 'dot'都过滤掉
      if (!isSegmentation(Types[i], 3)) { // 如果step3不能连续
        return false;
      }
      continue;
    }
    remain.push(Types[i])
  }
  return remain.flat()
}