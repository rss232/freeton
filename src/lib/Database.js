const { MongoClient } = require('mongodb')

class Database {
    constructor(cfg) {
        const { protocol, user, pass, hosts, options, dbname, collections } = cfg
        const uri = [
            protocol,
            '://',
            user ? `${user}:${pass}@` : '', //encodeURIComponent
            hosts.join(','),
            options ? `/?${options}` : '',
        ].join('')
        console.log('Connecting to ' + uri)
        this.client = new MongoClient(uri)
        this.dbname = dbname
        this.collections = collections
    }

    async init() {
        await this.client.connect()
        const db = this.client.db(this.dbname)
        this.clientCollection = db.collection(this.collections.client)
        this.statCollection = db.collection(this.collections.stat)
        console.log('Connected successfully to server')
    }

    async getClientRecord(clientId) {
        return this.clientCollection.findOne({ clientId }, { _id: -1 })
    }

    async getClientUrlByToken(accessToken) {
        return this.clientCollection
            .findOne(
                { 'confirmed.accessToken': accessToken },
                { projection: { confirmed: { url: 1 }, _id: 0 } },
            )
            .then((m) => (m ? m.confirmed.url : m))
    }

    async getClientUrl(clientId) {
        return this.clientCollection
            .findOne({ clientId }, { projection: { confirmed: { url: 1, delay: 1 }, _id: 0 } })
            .then((m) => (m ? m.confirmed : m))
    }

    async setUrl(clientId, { url, checkCode, accessToken }) {
        return this.clientCollection.updateOne(
            { clientId },
            { $set: { unconfirmed: { url, checkCode, accessToken, ts: Date.now() } } },
            { upsert: true },
        )
    }

    async confirmUrl(clientId, { confirmed }) {
        return this.clientCollection.updateOne(
            { clientId },
            { $set: { confirmed } },
            { upsert: false },
        )
    }

    async saveStat({ ts, stat }) {
        return this.statCollection.updateOne({ ts }, { $set: { stat } }, { upsert: true })
    }

    async getStat({ from, to }) {
        return this.statCollection
            .find({ $and: [{ ts: { $gte: from } }, { ts: { $lte: to } }] })
            .toArray()
    }
}

module.exports = Database
