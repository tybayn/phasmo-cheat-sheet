// Regenerates lang-v10/zh-tw/{data,wiki}.json from lang-v10/zh-cn using OpenCC (cn -> twp)
// plus the Taiwan usage pass in lang-v10/zh-tw/tw-phrases.js. Run after zh-cn changes:
//   node tools/zh-tw/build-zh-tw.js
// If new characters appear, re-run tools/zh-tw/subset-fonts.py as well.
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '../..')
const OpenCC = require(path.join(root, 'lang-v10/zh-tw/opencc-cn2t.js'))
const tw_phrases = require(path.join(root, 'lang-v10/zh-tw/tw-phrases.js'))
const convert = OpenCC.Converter({ from: 'cn', to: 'twp' })

// Keys describing the ZN-Drops desktop app: "應用" there means an application
const app_key = /^\{\{zntdl_/

function localize(key, value) {
    let out = convert(value)
    for (const [from, to] of tw_phrases) out = out.replaceAll(from, to)
    if (app_key.test(key)) out = out.replace(/應用(?!程式)/g, '應用程式')
    return out
}

for (const file of ['data.json', 'wiki.json']) {
    const src = JSON.parse(fs.readFileSync(path.join(root, 'lang-v10/zh-cn', file), 'utf8'))
    const out = Object.fromEntries(Object.entries(src).map(([k, v]) => [k, localize(k, v)]))
    fs.writeFileSync(path.join(root, 'lang-v10/zh-tw', file), JSON.stringify(out, null, 4), 'utf8')
    console.log(`zh-tw/${file}: ${Object.keys(out).length} keys`)
}