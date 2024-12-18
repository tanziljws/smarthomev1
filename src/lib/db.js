import mysql from 'mysql2'

const pool = mysql.createPool({
    host: '192.168.2.90',
    user: 'smarthome_user',
    password: 'adminse',
    database: 'smarthomev1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise()

export default pool 