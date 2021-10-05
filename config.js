const DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///squareonedb_auth_test"
    : "postgresql:///squareonedb";

const SECRET_KEY = process.env.SECRET_KEY || "SECRET-dog-chatter71384";

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
