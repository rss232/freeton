const express = require('express')
const app = express()
const port = 3000
const counter = { total: 0, msgs: 0, len: 0 }

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/*
 * If we know how many messages were sent and their
 * total length, then we can compare the results
 * This will be a pretty accurate test.
 */

function printline() {
    const args = [...arguments]
    console.log(args.map((n) => n.toString(10).padEnd(18, ' ')).join(''))
}

const failPercent = parseInt(process.argv[2], 10) || 0

app.post('/webhook', (req, res) => {
    if (Date.now() % Math.round(100 / failPercent) === 0) {
        console.log('HTTP status 500 sent')
        return res.status(500).end()
    }

    const xs = req.body
    counter.total++
    counter.msgs += xs.length
    counter.len += xs.reduce((a, c) => a + c.length, 0)

    printline(counter.total, counter.msgs, counter.len)
    res.end()
})
app.get('/webhook', (req, res) => {
    res.send('ok')
})

app.listen(port, () => {
    console.log(`Test webhook server  listening at http://localhost:${port}`)
    console.log('%d% of request aprox will be failed with HTTP status 500\n', failPercent)
    printline('Requests', 'Messages', 'Total size')
})
