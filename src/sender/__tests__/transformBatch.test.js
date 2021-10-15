const { transformBatch, getIds, getUrl } = require('../httpSendBatch')

const batch = [
    {
        _id: '5678',
        nonce: 'OjAVtPs8rpnX2mdaNYwZOq35mvSQ501R',
        message: 'AAA',
        url: 'http://mail.ru/',
    },

    {
        _id: '12345',
        nonce: 'OjAVtPs8rpnX2mdaNYwZOq35mvSQ501R',
        message: 'AAA',
        url: 'http://mail.ru/',
    },
]

const result1 = [
    { nonce: 'OjAVtPs8rpnX2mdaNYwZOq35mvSQ501R', message: 'AAA' },
    { nonce: 'OjAVtPs8rpnX2mdaNYwZOq35mvSQ501R', message: 'AAA' },
]

const result2 = ['5678', '12345']

test('Remove _ID and url', () => {
    expect(transformBatch(batch)).toEqual(result1)
})

test('Get IDs', () => {
    expect(getIds(batch)).toEqual(result2)
})

test('Get url', () => {
    expect(getUrl(batch)).toEqual('http://mail.ru/')
})
