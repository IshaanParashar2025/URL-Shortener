const mysql2 = require("mysql2/promise")

const db = mysql2.createPool(
    {
        host: process.env.mysql_host,
        user: process.env.mysql_user,
        password: process.env.mysql_password,
        database: process.env.mysql_database,
        port: process.env.mysql_port,
        ssl: {
            rejectUnauthorized: false
        }
    }
)

module.exports = db;
