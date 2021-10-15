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
        console.log('Connected successfully to server')
    }

    async getClientRecord(clientId) {
        return this.clientCollection.findOne({ clientId }, { _id: -1 })
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
}

module.exports = Database
