const Queue = require('bull')
const { Kafka, logLevel } = require('kafkajs')

const { processor } = require('./processor')
const { Database, Redis } = require('../lib')
const {
    errorTypes,
    signalTraps,
    dedupTTL,
    mongoOpts,
    redisOpts,
    kafkaOpts: { clientId, brokers, groupId, topic, ssl, sasl },
} = require('../config')

const main = async () => {
    try {
        const db = new Database(mongoOpts)
        const redis = new Redis(redisOpts, dedupTTL)
        const queue = new Queue('HTTP', {
            redis: redisOpts,
        })

        const consumer = new Kafka({
            clientId,
            brokers,
            ssl,
            sasl,
            logLevel: logLevel.INFO,
        }).consumer({ groupId })

        await Promise.all([redis.ready(), db.init()])

        await consumer.connect()

        await consumer.subscribe({ topic, fromBeginning: false })

        consumer.run({
            eachBatchAutoResolve: true,
            eachBatch: processor(queue, redis, db),
        })
        // Do not catch! exiting

        errorTypes.map((type) => {
            process.on(type, async (e) => {
                try {
                    console.log(`process.on ${type}`)
                    console.error(e)
                    await consumer.disconnect()
                    process.exit(0)
                } catch (_) {
                    process.exit(1)
                }
            })
        })

        signalTraps.map((type) => {
            process.once(type, async () => {
                try {
                    await consumer.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

main()
