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
app.post('/webhook', (req, res) => {

    if (Date.now() % 4 === 0) {
        // 25%
        return res.status(500)
    }

    const xs = req.body
    counter.total++
    counter.msgs += xs.length
    counter.len += xs.reduce((a, c) => a + c.length, 0)

    console.log(
        [counter.total, counter.msgs, counter.len]
            .map((n) => n.toString(10).padEnd(20, ' '))
            .join(''),
    )
    res.end()
})
app.get('/webhook', (req, res) => {
    res.send('ok')
})

app.listen(port, () => {
    console.log(`Test webhook server  listening at http://localhost:${port}`)
})
