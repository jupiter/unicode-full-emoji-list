'use strict'

const path = require('path')
const fs = require('fs')
const split = require('split')

const baseDir = path.resolve(process.argv[2])
if (!fs.existsSync(baseDir)) process.exit(1)

const versionTypes = {
  2: 'apple',
  3: 'google',
  4: 'facebook',
  5: 'windows',
  6: 'twitter'
}

const index = {}

let current
let versionOffset

process.stdin
  .pipe(split())
  .on('data', (line) => {
    const emojiMatch = line.match(/<td class='code'><a [^>]*name='([^']+)'/)
    if (emojiMatch) {
      const key = emojiMatch[1].split('_').map((hex) => String.fromCodePoint(parseInt(hex, 16))).join('')
      index[key] = current = {
        code: emojiMatch[1],
        description: null,
        versions: []
      }
      versionOffset = 0
      return
    } else {
    
      const nameMatch = line.match(/<td class='name'>([^<]+)<\/td>/)
      if (nameMatch) {
        current.description = nameMatch[1]
      }
    }
    versionOffset++
    if (versionOffset > 10) return

    // data:image/png;base64,iVB
    const imageMatch = line.match(/src='data:image\/png;base64,([^']+)'/)
    if (!imageMatch) return

    const versionType = versionTypes[versionOffset]
    if (!versionType) return

    const dir = path.join(baseDir, versionType)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    current.versions.push(versionType)
    const file = path.join(dir, current.code + '.png')
    fs.writeFileSync(file, Buffer.from(imageMatch[1], 'base64'))
  })
  .on('end', () => {
    const file = path.join(baseDir, 'index.json')
    fs.writeFileSync(file, JSON.stringify(index, null, '  '))
  })