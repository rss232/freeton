const assert = require('assert')
const R = require('ramda')
const cache = require('node-cache')
const { concurrent, serial } = require('fasy')

const { splitBySize, calcDelay } = require('../lib')

const {
    mongoOpts,
    queueOpts,
    httpOpts: { maxPostSize },
} = require('../config')

const groupByUrl = R.pipe(R.groupBy(R.prop('url')), R.values)
const split = splitBySize(maxPostSize)

const clientCache = new cache({ stdTTL: 60, checkperiod: 120 })

const processor = (queue, redis, db) => async ({ batch, resolveOffset, heartbeat }) => {

    const deserMsgs = batch.rawMessages.map((m) => {
        const key = m.key.toString()
        const [hash, nonce, message] = m.value.toString().split(' ')
        // we are not in production yet, so lets generate an
        // exeptions if data doesn't meet specification
        assert.ok(message)
        return {
            key,
            hash,
            nonce,
            message,
        }
    })

    // Warm clientCache
    const uniqHashes = R.map(R.prop('hash'), R.uniqBy(R.prop('hash'), deserMsgs))

    await concurrent(mongoOpts.concurrency).forEach(async (hash) => {
        if (clientCache.get(hash) === undefined) {
            const result = await db.getClientUrl(hash)
            if (result) {
                clientCache.set(hash, result)
            } else {
                clientCache.set(hash, {})
            }
        }
    }, uniqHashes)

    const knownUniqMessages = await Promise.resolve(deserMsgs)
        .then(R.filter((m) => clientCache.get(m.hash).url))
        .then((xs) =>
            serial.filterIn(async (m) => {
                const found = await redis.has(m.key)
                if (found) {
                    return false
                }
                await redis.setWithTTL(m.key)
                return true
            }, xs),
        )
        .then((xs) =>
            xs.map((m) => ({
                payload: m.nonce + ' ' + m.message,
                url: clientCache.get(m.hash).url,
            })),
        )

    const groupedByUrl = groupByUrl(knownUniqMessages)

    for (const xs of groupedByUrl) {
        const { url } = xs[0]
        const delay = calcDelay(await redis.getUrlDelay(url))

        const payloads = split(xs.map(R.prop('payload')))

        for (const payload of payloads) {
            queueOpts.backoff.options = { delay }
            await queue.add({ url, payload }, queueOpts)
        }
    }
}

module.exports = { processor }
