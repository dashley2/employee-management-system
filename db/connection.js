const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: 'root',
  // Your MySQL password
  password: 'Libron96!',
  database: 'business',
},
  console.log("Connected to the business database.")
);

module.exports = db;