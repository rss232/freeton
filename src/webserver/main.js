const http = require('http')
const https = require('https')
const app = require('./app')

const { Database } = require('../lib')
const {
    mongoOpts,
    frontOpts: { port, protocol, hostname },
} = require('../config')


const main = async () => {
    try {
        const db = new Database(mongoOpts)
        await db.init()

        const server = (protocol === 'http' ? http : https).createServer(app(db))

        const onError = (error) => {
            throw error.syscall !== 'listen'
                ? error
                : error.code === 'EACCES'
                ? new Error(`\nPort ${port} requires elevated privileges`)
                : 'EADDRINUSE'
                ? new Error(`\n ${hostname}:${port} is already in use`)
                : error
        }

        const onListening = () => {
            console.log(`Started REST API on ${protocol}//${hostname}:${port}`)
        }

        server.on('error', onError)
        server.on('listening', onListening)
        server.listen(port, hostname)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

main()
