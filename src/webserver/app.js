const cors = require('cors')
const express = require('express')
const createError = require('http-errors')

const UserInput = require('./UserInput')
const { b64ToStr } = require('../lib')

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

    app.get('/stats', (req, res) => {
       return res.send('Maybe there will be a statistics page, but not now') 
    })

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
