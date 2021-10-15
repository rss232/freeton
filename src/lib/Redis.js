const IORedis = require('ioredis')
const rateLimiter = require('redis-rate-limiter')

class Redis extends IORedis {
    constructor(config, ttl) {
        super(config)
        this.isReady = new Promise((resolve) => {
            this.on('ready', resolve)
        })
        this.ttl = ttl
    }

    async ready() {
        return this.isReady
    }

    async getUrlDelay(url) {
        return this.get(`${url}:delay`)
    }
    async setUrlDelay(url, delay) {
        return this.setex(`${url}:delay`, this.ttl, delay)
    }

    async has(k) {
        const result = await this.get(k)
        return result !== null
    }

    async setWithTTL(k, v = '') {
        return this.setex(k, this.ttl, v)
    }

    createLimiter(rateString) {
        const limiter = rateLimiter.create({
            redis: this,
            key: (x) => x,
            rate: rateString,
        })
        return (url) =>
            new Promise((resolve) => {
                limiter(url, function(err, rate) {
                    if (err) {
                        console.warn('Rate limiting not available')
                        resolve(false)
                    } else {
                        if (rate.over) {
                            resolve(false)
                        } else {
                            resolve(true)
                        }
                    }
                })
            })
    }
}

module.exports = Redis
