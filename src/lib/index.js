const uuid = require('uuid')
require('dotenv').config()
const env = require('env-var')

const Database = require('./Database')
const Redis = require('./Redis')
const calcDelay = require('./calcDelay')
const splitBySize = require('./splitBySize')

const asInt = (key) => env.get(key).required().asInt()

const asString = (key) => env.get(key).required().asString()

const asOptString = (key) => env.get(key).asString()

const b64ToStr = (b64) => Buffer.from(b64, 'base64').toString()

const multiline = (maybeXs) => (Array.isArray(maybeXs) ? maybeXs.join('\n') : maybeXs)

module.exports = {
    Database,
    Redis,
    asInt,
    asString,
    asOptString,
    calcDelay,
    b64ToStr,
    multiline,
    splitBySize,
    uuid,
}
