const mysql2 = require("mysql2/promise")

const db = mysql2.createPool(
    {
        host:"localhost",
        user:"root",
        password:"$trongPassword123",
        database:"url_db"
    }
)

module.exports = db;