var redis = require('redis');
var client;

module.exports = {
    getClient: function () {
        if (client) return client;
        client = redis.createClient({
            host     : process.env.REDIS_HOST,
            port     : process.env.REDIS_PORT,
            database : process.env.REDIS_DB,
            connectionLimit: 15,
            queueLimit: 30,
            acquireTimeout: 1000000
        });
        return client;
    }
};