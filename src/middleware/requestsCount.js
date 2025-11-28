const requestsCount = {};
function requestCounter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    if (!requestsCount[ip]) {
        requestsCount[ip] = 0;
    }

    req._addRequestCount = function() {
        requestsCount[ip] += 1;
    }

    req._getRequestCount = function() {
        return requestsCount[ip];
    }

    req._removeRequestCount = function() {
        if (requestsCount[ip]) {
            requestsCount[ip] = 0;
        }
    }

    next();
}

module.exports = requestCounter;