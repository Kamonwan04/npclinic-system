const { Pool } = require('pg');

const pool = new Pool({
  user: 'npstaff',
  host: '127.0.0.1',
  database: 'clinic_db',
  password: '1234',
  port: 5432,
});

module.exports = pool;