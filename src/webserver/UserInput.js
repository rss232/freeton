const http = require('http')
const https = require('https')

const { normalizeUrl } = require('./validations')
const { frontOpts } = require('../config')

const {
    fqdn,
    messages: {
        E_INP_INVALID,
        E_URL_REQURIED,
        E_FILE_NOT_EXISTS,
        E_ACCESS,
        E_INTERNAL,
        URL_CONFIRMED,
        E_CODE,
    },
} = frontOpts

const { uuid, multiline } = require('../lib')
const ExError = require('./ExError')

/*
 * We expect from user:
 *   an empty string - this is a CHECK command,
 *   NOT empty string - this is a request to set new URL
 */

const MAX_GET_SIZE = 1000

const renderCheckFile = (code) => [
    `<html>`,
    `   <head>`,
    `       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`,
    `   </head>`,
    `   <body>Verification: ${code} </body>`,
    `</html>`,
    ``,
]

class UserInput {
    constructor(db, hash) {
        this.db = db
        this.hash = hash
    }

    async dispatch(text) {
        this.record = await this.db.getClientRecord(this.hash)
        return text ? this._setEndpoint(text) : this._checkEndpoint()
    }

    async _setEndpoint(text) {
        const url = normalizeUrl(text)
        let answer
        if (url) {
            const accessToken = uuid.v4()
            const checkCode = uuid.v4()

            await this.db.setUrl(this.hash, { url, checkCode, accessToken })

            answer = [
                'Please follow the instructions:',
                `1. Create file ${checkCode + '.html'} in your webroot with the following content:`,
                ...renderCheckFile(checkCode),
                `2. Call DeBot again and send us just a blank line, after that we confirm your endpoint`,
            ]
        } else {
            // User entered something but it is not a valid URL
            answer = this.record ? E_INP_INVALID : E_URL_REQURIED
        }

        return multiline(answer)
    }

    async _checkEndpoint() {
        const unconfirmed = this.record ? this.record.unconfirmed : null

        if (!unconfirmed) return E_URL_REQURIED

        let answer
        const url = [new URL(unconfirmed.url).origin, unconfirmed.checkCode + '.html'].join('/')

        try {
            await new Promise((resolve, reject) => {
                const httpClient = url.startsWith('https:') ? https : http
                httpClient
                    .get(url, (res) => {
                        const { statusCode } = res
                        if (statusCode !== 200) {
                            reject(new ExError(statusCode))
                        }

                        let txt = ''
                        res.setEncoding('utf8')
                        res.on('data', (chunk) => {
                            txt += chunk
                            if (txt.length > MAX_GET_SIZE) {
                                console.log(`Resource stream exceeded limit (${MAX_GET_SIZE})`)
                                res.destroy() // Abort the response (close and cleanup the stream)
                                reject(new ExError())
                            }
                        })
                        res.on('end', () => {
                            if (txt.includes(unconfirmed.checkCode)) {
                                resolve()
                            } else {
                                reject(new ExError())
                            }
                        })
                    })
                    .on('error', reject)
            })

            answer = await this.db
                .confirmUrl(this.hash, {
                    confirmed: { ...unconfirmed, ts: Date.now(), delay: 0 }, //
                })
                .then((_) => {
                    const statUrl = `${fqdn}stats/?token=${unconfirmed.accessToken}`
                    return [unconfirmed.url, URL_CONFIRMED, statUrl]
                })
                .catch((err) => {
                    console.log(err)
                    return E_INTERNAL
                })
        } catch (err) {
            if (err.name === 'ExError') {
                answer = err.statusCode
                    ? // The request was made and the server responded with a status code !== 2xx
                      [E_FILE_NOT_EXISTS, url, `Status code ${err.statusCode}`]
                    : [E_CODE, unconfirmed.checkCode + '.html']
            } else {
                // General access error
                answer = [E_ACCESS, err.message]
            }
        }

        return multiline(answer)
    }
}

module.exports = UserInput
