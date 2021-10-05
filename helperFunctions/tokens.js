const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return sigend JWT from user data */

function createToken(user) {
  console.assert(
    user.status !== undefined,
    "createToken passed user without employee property"
  );

  let payload = {
    username: user.username,
    status: user.status || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
