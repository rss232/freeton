const strategies = (onAttemptFn) => ({

    exponential: (attemptsMade, err) => {
        const url = err.url
        // eslint-disable-next-line no-unused-vars
        const originalErr = err.originalErr
        /*
         * originalErr contains an HTTP or NETWORK error
         * (e.g. HTTP status 429 or 500 or "no root to host"),
         * but whatever the reason we following the same algorithm
         */
        let delayMs

        if (originalErr) {
            delayMs = Math.round((Math.pow(2, attemptsMade) + Math.random()) * 1000)

            console.log('Attempt number %d, delay for %d ms because of errors', attemptsMade, delayMs)

            // Fire and forget. we don't want to handle errors
            onAttemptFn(url, attemptsMade, delayMs).catch(console.log)
        } else {
            delayMs = Math.round((2 + Math.random()) * 1000)
            console.log( 'Attempt number %d, next delay till %d', attemptsMade, delayMs)
        }

        return delayMs
    },
})

module.exports = { strategies }
