const { split } = require('ramda')
const { splitBySize } = require('../../lib')

const xs1 = split(' ', 'Makes a shallow clone of an object, omitting')
const xs2 = ['the']
const xs3 = split(' ', 'the property at the given path. Note')
const xs4 = ['']
const xs5 = []

const split100 = splitBySize(100)

const split10 = splitBySize(10)

test('splitBySize', () => {
    expect(split100(xs1)).toEqual([
        ['Makes', 'a', 'shallow', 'clone', 'of', 'an', 'object,', 'omitting'],
    ])
    expect(split10(xs3)).toEqual([['the'], ['property', 'at'], ['the', 'given'], ['path.', 'Note']])
    expect(split10(xs4)).toEqual([['']])
    expect(split10(xs5)).toEqual([[]])
})
