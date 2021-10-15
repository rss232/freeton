db.createCollection('requests')
db.requests.createIndex({ clientId: 1 }, { unique: true })
db.requests.insert({
    clientId: 'myhash',
    unconfirmed: {
        url: 'http://testwebserver:12345/',
        checkCode: '651ad709-a5cd-412f-a820-0075f033df46',
        accessToken: 'e96ac131-7dee-49fe-ab17-35856c0c4dec',
        ts: 1633949159462,
    },
    confirmed: {
        url: 'http://testwebserver:12345/',
        checkCode: '651ad709-a5cd-412f-a820-0075f033df46',
        accessToken: 'e96ac131-7dee-49fe-ab17-35856c0c4dec',
        ts: 1633949273355,
        delay: 0,
    },
})
