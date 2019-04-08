
const list = require('./resources')

Object.keys(list).forEach((key) => {
    const emoji = list[key]
    emoji.versions = emoji.versions.reduce((obj, val) => {
        obj[val] = path.join(__dirname, 'resources', val, `${emoji.code}.png`)
        return obj
    }, {})
})

module.exports = list