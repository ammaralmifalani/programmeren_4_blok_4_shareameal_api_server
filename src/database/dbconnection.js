const mysql = require('mysql2');
require('dotenv').config();
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 100000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
});

pool.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});
pool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});
module.exports = pool;
