const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return sigend JWT from user data */

function createToken(user) {
  console.assert(
    user.id !== undefined,
    "createToken was passed a user without an id property"
  );

  let payload = {
    userId: user.id,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
