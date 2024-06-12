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
  // build 时间太长了，而且看不到反馈，所以注释掉，需要手动 build
  // execSync('npm install')
  // execSync('npm run build')
  // 读取 package.json 内容
  const packageJson =  require('../package.json')
  // 从 icons.json 中为每一个 icon 重新生成 exports 字段。
  const newExports = {}
  const icons = require('../icons.json', {type: 'json'})
  icons.forEach(icon => {
    // 连字符转成驼峰
    const iconName = icon.name.replace(/-([a-z])/g, g => g[1].toUpperCase())
    // 首字母也要大写
    const exportName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
    newExports[`./${exportName}.js`] = `./dist/${exportName}.js`
  })
  // 重新写入 package.json
  packageJson.exports = newExports
  fs.writeFileSync('./package.json', `${JSON.stringify(packageJson, null, 2)}\n`)

  const newVersion = execSync(`npm version ${version}`)
  execSync('git push')
  execSync(`npm publish ./`)
  console.log(`published version ${newVersion}`)
} catch (e) {
  console.error(e)
  process.exit(1)
}
