const { URL } = require('url')

// str -> str | null
const normalizeUrl = (str) => {
    try {
        let nstr = str.toLowerCase().trim()

        if (!/^http:|^https:/.test(nstr)) nstr = 'http://' + nstr

        const url = new URL(nstr)
        // I want that domain always has '."
        return url.hostname.includes('.') ? url.toString() : null
    } catch (_) {
        return null
    }
}

module.exports = { normalizeUrl }
