const { Client } = require("pg/lib");
const { DB_URI } = require("./config");

const client = new Client({
  connectionString: DB_URI,
});

client.connect();

module.exports = client;
