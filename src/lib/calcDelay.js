const calcDelay = (delay) => {
    if (delay === undefined || delay === null) return 0
    delay = parseInt(delay, 10)
    const now = Date.now()
    return now > delay ? 0 : delay - now
}

module.exports = calcDelay
