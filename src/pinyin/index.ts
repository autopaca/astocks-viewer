import dictJson from './word.json';

function isPosValid(newPos: number[], startPos: number[]) {
  const [a1, b1, c1] = newPos;
  const [a0, b0, c0] = startPos;
  const asame = a1 === a0; const bsame = b1 === b0; const
    csame = c1 === c0;
  switch(true) {
    case (asame && (!bsame) && c0 >= 0):
    case (asame && bsame && csame):
    case (!asame && (c1 > 0)):
    case (asame && bsame && (c1 - c0 != 1)):
      return false;
  }
  return newPos;
}

function getPos(line: string[][], char: string, lastPos: number[]) {
  const [a0, b0, c0] = lastPos;
  let a = a0; let b = b0; let c = c0;
  const result = [];
  for (; a < line.length; a += 1, b = 0, c = 0) {
    const word = line[a];
    for (; b < word.length; b += 1, c = 0) {
      const str = word[b];
      for (; c < str.length; c += 1) {
        const strarr = str.split('');
        const t = strarr[c] || '';
        if (t.toUpperCase() === char.toUpperCase()) {
          if (isPosValid([a, b, c], lastPos)) {
            result.push([a, b, c]);
          }
        }
      }
    }
    if (result.length)
      break;
  }
  return result;
}

function max(arr: number[][] = []): number[]{
  return arr.reduce((m, current) => {
    if (current.length > m.length) {
      return current;
    }
    return m;
  }, [])
}

function getSubTestRank(line: string[][], subTest: string[], startPos: number[], parentRank: number[] = []): number[] {
  if (!subTest.length) return parentRank;
  const positions = getPos(line, subTest[0], startPos);
  if (positions && positions.length) {
    const newSubranks = positions.map((newPos) => {
      let newRank = parentRank.map(a => a);
      if (newPos[0] === 0)
        newRank = [0];
      if (newPos[0] !== startPos[0]) {
        newRank.push(newPos[0])
      }
      return getSubTestRank(line, subTest.slice(1), newPos, newRank)
    });
    return max(newSubranks);
  } else {
    return [];
  }
}

export class Pinyin {
  map: Record<string, string[]>;
  constructor() {
    this.map = {};
    this.initDict(dictJson);
  }

  genPinyin(s: string) {
    const r: string[][] = [];
    const sarr = s.split('');
    sarr.forEach(c => {
      const x = this.map[c];
      // x is pinyin[]
      if (x) {
        r.push(x.concat(c));
      } else {
        r.push([c])
      }
    });
    return r;
  }

  initDict(wordMap: Record<string, string>) {
    Object.keys(wordMap).forEach(k => {
      // key is pinyin, value is chinese word
      const s = wordMap[k].split(',');
      // s is the array of chinese words
      s.forEach(c => {
        if (this.map[c]) {
          this.map[c].push(k);
        } else {
          this.map[c] = [k];
        }
      });
      // map is word -> pinyin[]
    });
  }

  test(str: string, test: string) {
    const arr = this.genPinyin(str);
    const testArr = test.split('');
    let startPos = [0, 0, -1];
    return getSubTestRank(arr, testArr, startPos, []);
  }
}