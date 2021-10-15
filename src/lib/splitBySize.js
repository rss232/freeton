const splitBySize = (maxSize) => (arr) => {
    const xss = []
    const xs = []
    let size = 0
    if (arr.length == 0) return [[]]
    for (let i = 0; i < arr.length; i++) {
        xs.push(arr[i])
        size += arr[i].length
        const n = arr[i + 1] // next elem

        if (n === undefined || size + n.length > maxSize) {
            xss.push([...xs])
            size = 0
            xs.length = 0
        }
    }
    return xss
}

module.exports = splitBySize
