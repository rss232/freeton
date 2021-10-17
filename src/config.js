const { asString, asOptString, asInt } = require('./lib')

const isTest = asOptString('TESTS')

const config = {
    httpOpts: {
        /*
         * Messages are batched for high throughputf.
         * To disable this feature set the value to 0
         * if the size of one original message exceeds
         * the specified value, then this rule is ignored
         */
        maxPostSize: 1048576, // 1Mb
        /*
         * The maximum total number of POST connections from all our servers
         */
        maxConnectionsTotal: 300,
        /*
         * The maximum rate of POSTs per URL
         */
        maxRate: '100/second',
    },
    queueOpts: {
        /*
         *  The number of attempts after which the message will be discarded.
         */
        attempts: asInt('ATTEMPTS'),
        /*
         *  BACKOFF STRATEGY
         *
         *  For tests we use simple exponential backoff strategy
         *  For production use, a more complex strategy can be implemented.
         *  See `src/sender/backoffStrategies.js`
         *
         */
        backoff: {
            type: 'exponential',
        },
        /*
         * After this time, the worker will be considered dead, and his job
         * will be transferred to another worker
         */
        timeout: 120000,
        /*
         * Finished jobs are deleted
         */
        removeOnComplete: true,
    },
    statOpts: {
        /*
         * Granularity of statistics
         */
        period: 'minute',
    },
    /*
     *  Redis is used as a message queue, and it also caches
     *  the IDs of already sent messages for deduplication.
     */
    dedupTTL: asInt('DEDUP_SECONDS'),
    redisOpts: {
        port: asInt('REDIS_PORT'),
        host: asString('REDIS_HOST'),
        password: asString('REDIS_PASSWORD'),
        enableReadyCheck: true,
        enableOfflineQueue: false,
    },
    /*
     *  MongoDB is used to store user information and statistics
     */
    mongoOpts: {
        protocol: 'mongodb',
        user: asString('MONGO_INITDB_ROOT_USERNAME'),
        pass: asString('MONGO_INITDB_ROOT_PASSWORD'),
        hosts: [asString('MONGO_HOST') + ':' + asString('MONGO_PORT')],
        dbname: asString('MONGO_INITDB_DATABASE'),
        options: '',
        concurrency: asInt('MONGO_CONCURRENCY_LEVEL'),
        /*
         * Batching messages when inserting
         */
        collections: {
            client: 'requests',
            stat: 'stat',
        },
    },

    kafkaOpts: {
        brokers: asString('KAFKA_BROKERS').split(','),
        ssl: false,
        sasl: isTest
            ? undefined
            : {
                  mechanism: 'scram-sha-512',
                  username: asString('KAFKA_USER'),
                  password: asString('KAFKA_PASSWORD'),
              },
        clientId: asString('KAFKA_CLIENT_ID'),
        groupId: asString('KAFKA_GROUP_ID'),
        topic: asString('KAFKA_TOPIC'),
    },

    frontOpts: {
        port: asInt('WEB_PORT'),
        protocol: asString('WEB_PROTOCOL'),
        hostname: asString('WEB_INTERFACE'),
        fqdn: asOptString('FQDN'),
        messages: {
            E_CODE: 'Confirmation code not found in',
            E_URL_REQURIED: 'Invalid data entered. Please enter a valid URL',
            E_INP_INVALID:
                'Input is not correct. You can enter:\n' +
                '- an empty line, to check your current URL\n' +
                '- or the new URL, to replace the previous one',
            E_FILE_NOT_EXISTS: "Check failed, can't GET",
            E_ACCESS: 'Check failed',
            E_TOKEN_REQUIRED: 'Token required',
            E_TOKEN_VALIDATION: 'Token not valid',
            E_INTERNAL: ':-( Something went wrong, please try again',
            URL_CONFIRMED: 'URL endpoint confirmed, use this link to get your statistics:',
        },
    },

    errorTypes: ['unhandledRejection', 'uncaughtException'],
    signalTraps: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
}

module.exports = config
