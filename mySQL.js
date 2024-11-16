const mysql = require('mysql2')
const dotenv = require('dotenv')
dotenv.config( { path:'./.env' } )

const connect = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
})

connect.connect((err) => {
    if (err) {
        console.error('Connection Error',err)
        return
    }
    console.log('Connection Entablished')
})

module.exports = connect; //export connect ออกไปใช้