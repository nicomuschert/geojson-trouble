import { default as fix, applyRightHandRule, fixRings } from './index.js'

const isFn = fn => typeof fn === 'function'
const sourceMapResolvesTS = () => {
  try {
    fix(null)
  } catch (error) {
    return /\/index\.ts/.test(error.stack)
  }
}

if (!isFn(fix)) process.exit(2)
if (!isFn(applyRightHandRule)) process.exit(3)
if (!isFn(fixRings)) process.exit(4)
if (!sourceMapResolvesTS()) process.exit(5)
