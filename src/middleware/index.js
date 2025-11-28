require("dotenv").config();
const requestsCount = require("./requestsCount");
const SECRET_TOKEN = process.env.SECRET_TOKEN
const MAX_REQUESTS = 10;

module.exports = [
    requestsCount,
    (req, res, next) => {
        const token = req.headers["x-captio-token"];
        req._addRequestCount();
        const requests = req._getRequestCount();
        if (requests > MAX_REQUESTS) {
            return res.status(429).json({ error: "too_many_requests", requests_remaining: 0 });
        }

        if (!token) {
            return res.status(401).json({ error: "unauthorized", requests_remaining: MAX_REQUESTS - requests } );
        }

        if (token !== SECRET_TOKEN) {
            return res.status(401).json({ error: "unauthorized", requests_remaining: MAX_REQUESTS - requests });
        }

        req._removeRequestCount();

        next();
    }
];