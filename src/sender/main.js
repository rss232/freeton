const Queue = require('bull')

const { Redis, calcDelay } = require('../lib')
const { dedupTTL, redisOpts, httpOpts, mongoOpts, statOpts } = require('../config')

const { post } = require('./post')
const { Stats } = require('./Stats')
const { strategies } = require('./backoffStrategies')

class JobError extends Error {
    constructor({ url, originalErr }) {
        super()
        this.url = url
        this.originalErr = originalErr
    }
}

const main = async () => {
    try {
        const redis = new Redis(redisOpts, dedupTTL)
        await redis.ready()
        const limiter = redis.createLimiter(httpOpts.maxRate)

        const onAttemptFn = (url, num, delayMs) => {
            // Slow down ALL new coming messages for this url
            return redis.setUrlDelay(url, Date.now() + delayMs).then(console.log)
        }

        const queue = new Queue('HTTP', {
            redis: redisOpts,
            settings: { backoffStrategies: strategies(onAttemptFn) },
        })

        const stat = new Stats({ mongoOpts, statOpts })
        await stat.init()

        const handler = async (job) => {
            const { url, payload } = job.data

            const delay = calcDelay(await redis.getUrlDelay(url))

            const ACCEPTABLE_CLOCK_SKEW_MS = 500

            if (delay < ACCEPTABLE_CLOCK_SKEW_MS) {
                if (await limiter(url)) {
                    const result = await post(url, payload)
                    if (result.ok) {
                        // Gathering statistics
                        await stat.gather({ url })
                    } else {
                        throw new JobError({ url, originalErr: result.err })
                    }
                } else {
                    // No free connections for this url
                    throw new JobError({ url, originalErr: { rateLimit: true } })
                }
            } else {
                // Backoff this message
                throw new JobError({ url })
            }
        }

        queue.process(httpOpts.maxConnectionsTotal, handler)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

main()
