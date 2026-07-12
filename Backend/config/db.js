const mysql2 = require("mysql2/promise")

const db = mysql2.createPool(
    {
<<<<<<< HEAD
        host:"localhost",
        user:"root",
        password:"$trongPassword123",
        database:"url_db",
        ssl: {
            rejectUnauthorized: false
        }

=======
        host: process.env.mysql_host,
        user: process.env.mysql_user,
        password: process.env.mysql_password,
        database: process.env.mysql_database,
        port: process.env.mysql_port,
        ssl: {
            rejectUnauthorized: false
        }
>>>>>>> changes
    }
)

module.exports = db;
