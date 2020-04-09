import { default as Cutter } from './index.js'

const isFn = fn => typeof fn === 'function'
const sourceMapResolvesTS = () => {
  try {
    new Cutter().cut(null)
  } catch (error) {
    return /\/index\.ts/.test(error.stack)
  }
}

if (!isFn(Cutter)) process.exit(2)
if (!sourceMapResolvesTS()) process.exit(5)
