import { default as webmap, applyWebMapCoordinates, bbox } from './index.js'

const isFn = fn => typeof fn === 'function'
const sourceMapResolvesTS = () => {
  try {
    webmap(null)
  } catch (error) {
    return /\/index\.ts/.test(error.stack)
  }
}

if (!isFn(webmap)) process.exit(2)
if (!isFn(applyWebMapCoordinates)) process.exit(3)
if (!isFn(bbox)) process.exit(4)
if (!sourceMapResolvesTS()) process.exit(5)
