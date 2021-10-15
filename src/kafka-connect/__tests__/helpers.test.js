const { groupByUrl, calcDelay } = require('../.,/lib')

const messages = [
    { url: 1, payload: 'A1' },
    { url: 1, payload: 'B1' },
    { url: 2, payload: 'C2' },
    { url: 3, payload: 'D3' },
    { url: 2, payload: 'E2' },
    { url: 1, payload: 'F1' },
]

const result = [
    [
        { url: 1, payload: 'A1' },
        { url: 1, payload: 'B1' },
        { url: 1, payload: 'F1' },
    ],
    [
        { url: 2, payload: 'C2' },
        { url: 2, payload: 'E2' },
    ],
    [{ url: 3, payload: 'D3' }],
]

test('groupByUrl', () => {
    expect(groupByUrl(messages)).toEqual(result)
})

test('calcDelay', () => {
    expect(calcDelay(0)).toEqual(0)
    expect(calcDelay(Date.now() - 10000)).toEqual(0)
    expect(calcDelay(Date.now())).toEqual(0)
    expect(calcDelay(Date.now() + 1000)).toEqual(1000)
})
