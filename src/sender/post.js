const axios = require('axios')
const { queueOpts } = require('../config')

const post = async (url, payload) => {
    const result = {}

    try {
        const response = await axios.post(url, payload, {
            timeout: queueOpts.timeout / 2,
        })
        result.status = response.status
        result.ok = response.status === 200
    } catch (err) {
        result.ok = false
        result.err = {
            message: err.message,
            status: err.status,
            code: err.code,
        }
    }
    return result
}

module.exports = { post }
