const cors = require('cors')
const moment = require('moment')
const express = require('express')
const createError = require('http-errors')
const { reject, isNil, filter, map, propEq } = require('ramda')

const UserInput = require('./UserInput')
const { b64ToStr } = require('../lib')
const {
    frontOpts: { messages },
} = require('../config')

const app = express()
app.use(
    cors({
        origin: '*',
    }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

module.exports = (db) => {
    app.post(
        '/freeton/api/v0',
        expressTryCatch(async (req, res) => {
            const { hash, data } = req.body

            const text = b64ToStr(data)
                .trim()
                .toLowerCase()

            const answer = await new UserInput(db, hash).dispatch(text)
            return res.send(answer)
        }),
    )

    app.get(
        '/stats',
        expressTryCatch(async (req, res, next) => {
            const { token, from, to } = req.query

            if (!token) return next(createError(400, messages.E_TOKEN_REQUIRED))

            const url = await db.getClientUrlByToken(token)
            if (!url) return next(createError(401, messages.E_TOKEN_VALIDATION))

            const momentFrom = moment(from).startOf('day')
            const momentTo = moment(to).endOf('day')

            const data = await db
                .getStat({
                    from: momentFrom.unix(),
                    to: momentTo.unix(),
                })
                .then(
                    map((o) => {
                        const [y] = filter(propEq('url', url), o.stat)
                        return y ? [o.ts, y.val] : null
                    }),
                )
                .then(reject(isNil))

            return res.json({
                from: momentFrom.format('YYYY-MM-DD'),
                to: momentTo.format('YYYY-MM-DD'),
                url,
                data,
            })
        }),
    )

    app.use((req, res, next) => {
        next(createError(404))
    })

    app.use((err, req, res, _) => {
        const { status, message } = err
        if (status) {
            res.status(status).send(message)
        } else {
            console.error(err.stack)
            res.status(500).send('Internal Server Error')
        }
    })
    return app
}

function expressTryCatch(fn) {
    return function(req, res, next) {
        return Promise.resolve(fn(req, res, next)).catch(next)
    }
}
