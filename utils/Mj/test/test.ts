import { TileMj } from "../../../interface";
import { originalList } from "../mjAllTiles";
import { isSorted } from "../mjHu";
import { HuConfig } from '../index'
import { randomIndex } from "../../index";

const jokers: Array<TileMj> = [
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'bamboo', 'number': '9', 'index': 26 },
]


const Test: Array<TileMj> = [
    {
      type: 'character',
      number: '4',
      index: 3,
    },
    {
      type: 'character',
      number: '5',
      index: 4,
    },
    {
      type: 'character',
      number: '6',
      index: 5,
    },
    {
      type: 'character',
      number: '7',
      index: 6,
    },
    {
      type: 'character',
      number: '9',
      index: 8,
    },
    {
      type: 'bamboo',
      number: '4',
      index: 21,
    },
    {
      type: 'bamboo',
      number: '4',
      index: 21,
    },
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'bamboo', 'number': '9', 'index': 26 },
    { 'type': 'bamboo', 'number': '9', 'index': 26 },
    { 'type': 'bamboo', 'number': '9', 'index': 26 },
    {
      type: 'bamboo',
      number: '5',
      index: 22,
    },
    {
      type: 'dot',
      number: '3',
      index: 38,
    },
    {
      type: 'dot',
      number: '5',
      index: 40,
    }
  ]

  // const jokers: Array<TileMj> = [
  //   { type: 'dot', number: '7', index: 42 },
  //   { type: 'dot', number: '8', index: 43 }
  // ]
  
  const T_PingHu1: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'bamboo', 'number': '1', 'index': 18 },
    { 'type': 'bamboo', 'number': '2', 'index': 19 },
    { 'type': 'bamboo', 'number': '3', 'index': 20 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
  ]
  
  const T_PingHu2: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
  ]
  
  
  const T_PingHu3: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
  ]
  
  const T_PingHu4: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'north', 'index': 57 },
  ]
  
  const T_PingHu5: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'south', 'index': 55 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
  ]
  
  const T_PingHu6: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '5', 'index': 40 },
    { 'type': 'dot', 'number': '7', 'index': 42 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'west', 'index': 56 }
  ]
  
  const T_PingHu7: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'dot', 'number': '5', 'index': 40 },
    { 'type': 'dot', 'number': '6', 'index': 41 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'west', 'index': 56 }
  ]
  
  const T_PingHu8: Array<TileMj> = [
    { 'type': 'character', 'number': '6', 'index': 5 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'dot', 'number': '3', 'index': 38 },
    { 'type': 'dot', 'number': '7', 'index': 42 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 56 },
    { 'type': 'wind', 'number': 'north', 'index': 57 },
    { 'type': 'wind', 'number': 'north', 'index': 57 },
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
  ]
  
  const T_PingHuE1: Array<TileMj> = [
    { 'type': 'character', 'number': '2', 'index': 1 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'bamboo', 'number': '1', 'index': 18 },
    { 'type': 'bamboo', 'number': '3', 'index': 20 },
    { 'type': 'bamboo', 'number': '5', 'index': 22 },
    { 'type': 'bamboo', 'number': '7', 'index': 24 },
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'dot', 'number': '1', 'index': 36 },
    { 'type': 'dot', 'number': '1', 'index': 36 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 55 },
    { 'type': 'wind', 'number': 'north', 'index': 56 },
  ]
  
  const T_PingHuE2: Array<TileMj> = [
    { 'type': 'character', 'number': '2', 'index': 1 },
    { 'type': 'character', 'number': '2', 'index': 1 },
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'bamboo', 'number': '1', 'index': 18 },
    { 'type': 'bamboo', 'number': '3', 'index': 20 },
    { 'type': 'bamboo', 'number': '5', 'index': 22 },
    { 'type': 'bamboo', 'number': '7', 'index': 24 },
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'dot', 'number': '1', 'index': 36 },
    { 'type': 'dot', 'number': '1', 'index': 36 },
    { 'type': 'wind', 'number': 'east', 'index': 54 },
    { 'type': 'wind', 'number': 'west', 'index': 55 },
    { 'type': 'wind', 'number': 'west', 'index': 55 },
  ]
  
  const T_PingHuE3: Array<TileMj> = [
    { type: 'character', number: '1', index: 0 },
    { type: 'character', number: '2', index: 1 },
    { type: 'character', number: '6', index: 5 },
    { type: 'character', number: '6', index: 5 },
    { type: 'bamboo', number: '1', index: 18 },
    { type: 'bamboo', number: '3', index: 20 },
    { type: 'bamboo', number: '9', index: 26 },
    { type: 'dot', number: '1', index: 36 },
    { type: 'dot', number: '2', index: 37 },
    { type: 'dot', number: '8', index: 43 },
    { type: 'wind', number: 'west', index: 56 },
    { type: 'color', number: 'red', index: 67 },
    { type: 'color', number: 'red', index: 67 },
    { type: 'color', number: 'red', index: 67 }
  ]
  
  
  const T_PingHuE4: Array<TileMj> = [
    { 'type': 'character', 'number': '7', 'index': 6 },
    { 'type': 'character', 'number': '8', 'index': 7 },
    { 'type': 'character', 'number': '9', 'index': 8 },
    { 'type': 'bamboo', 'number': '3', 'index': 20 },
    { 'type': 'bamboo', 'number': '5', 'index': 22 },
    { 'type': 'bamboo', 'number': '7', 'index': 24 },
    { 'type': 'bamboo', 'number': '8', 'index': 25 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'dot', 'number': '8', 'index': 43 },
    { 'type': 'color', 'number': 'red', 'index': 67 },
    { 'type': 'color', 'number': 'green', 'index': 68 },
    { 'type': 'color', 'number': 'white', 'index': 69 },
    { 'type': 'color', 'number': 'white', 'index': 69 },
    { 'type': 'color', 'number': 'white', 'index': 69 }
  ]
  

  console.log(HuConfig(Test, jokers))

function randomMahjongTiles() {
    // 创建包含所有麻将的数组
    // 从数组中随机选择14张麻将牌
    const selectedTiles: Array<TileMj> = [];
    while (selectedTiles.length < 14) {
        // 从剩余麻将中随机选择一张
        const tile: TileMj = originalList[randomIndex(originalList.length, 0)];
        // 判断该张麻将是否已经选择了4张
        if (selectedTiles.filter(t => t === tile).length < 4) {
            selectedTiles.push(tile);
        }
    }
    return isSorted(selectedTiles);
}


const isRandom = () => {
    // 调用函数获取随机的14张麻将牌
    const randomTiles = randomMahjongTiles();
    // console.log(randomTiles)
    console.log(HuConfig(randomTiles, jokers))
}


// const startTime = performance.now();

const calculateExecutionTime = (iterations: number) => {

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
        // 调用函数获取随机的14张麻将牌
        isRandom()
    }
    // 记录结束时间

    const endTime = performance.now();

    // 计算执行时间
    const executionTime = endTime - startTime;

    // 打印执行时间
    console.log(`循环${iterations}次的执行时间：${executionTime} 毫秒`);
}

// calculateExecutionTime(10)