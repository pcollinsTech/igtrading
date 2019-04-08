var mysql = require('mysql');
var pool;

module.exports = {
    getPool: function () {
        if (pool) return pool;
        pool = mysql.createPool({
            host     : process.env.DB_HOST,
            user     : process.env.DB_USER,
            password : process.env.DB_PASS,
            port     : process.env.DB_PORT,
            database : process.env.DB_NAME,
            connectionLimit: 15,
            queueLimit: 30,
            acquireTimeout: 1000000
        });
        return pool;
    }
};