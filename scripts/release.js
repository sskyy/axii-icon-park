import {execSync} from 'child_process'
import fs from 'fs'
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const version = process.argv[2]
if (!version) {
  throw new Error('Missing version argument')
}

//
const gitStatus = execSync('git status ./ --porcelain').toString().trim()
const isClean = gitStatus  === ''
if (!isClean) {
  throw new Error('Working tree is not clean')
}

try {
  const newVersion = execSync(`npm version ${version}`)
  execSync('git push')
  execSync(`npm publish ./`)
  console.log(`published version ${newVersion}`)
} catch (e) {
  console.error(e)
  process.exit(1)
}
