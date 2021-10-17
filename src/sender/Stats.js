const moment = require('moment')
const assert = require('assert')
const Cache = require('node-cache')

const { Database } = require('../lib')

const FLUSH_INTERVAL = 1000 // ms
/*
 *
 */
const cache = new Cache({ stdTTL: 600, checkperiod: 60 })

class Stats {
    constructor({ mongoOpts, statOpts }) {
        this.period = statOpts.period

        // So far, only minutes. Add more periods if needed in the future
        assert.equal(this.period, 'minute')

        this.db = new Database(mongoOpts)
    }
    async init() {
        await this.db.init()
        const that = this
        setInterval(that.save.bind(that), FLUSH_INTERVAL)
    }
    gather({ url }) {
        const key = moment()
            .startOf(this.period)
            .unix()

        const val = cache.get(key) || {}
        val[url] = val[url] === undefined ? 1 : val[url] + 1
        cache.set(key, val)
    }

    async save() {
        const previousPeriod = moment()
            .subtract(1, this.period)
            .startOf(this.period)
            .unix()

        const stat = cache.get(previousPeriod)
        if (stat) {
            const data = []
            for (const k in stat) {
                data.push({ url: k, val: stat[k] })
            }

            // just log, because if an error occurs,
            // the next attempt will be retried in `FLUSH_INTERVAL` minutes
            await this.db.saveStat({ ts: previousPeriod, stat: data }).catch(console.log)
            cache.set(previousPeriod, null)
        }
    }
}

module.exports = { Stats }
