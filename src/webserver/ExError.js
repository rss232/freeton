class ExError extends Error {
    constructor(code, message) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = code
    }
}

module.exports = ExError
