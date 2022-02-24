"use strict";

//middleware to handle common auth cases in routes

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Employee = require("../models/employee");

/** Middleware: Authenticate employee
 *
 * If a token was provided, verify it, and if valid, store the token playload
 * on res.locals (this will include the id, username and role field)
 *
 * It's not an error if no token was provided or if token is not valid.
 */

async function getEmployeeForToken(req) {
  const authHeader = req.header && req.headers.authorization;
  if (!authHeader) {
    console.log("auth header not supplied");
    return;
  }

  const token = authHeader.replace(/^[Bb]earer /, "").trim();
  const parsedToken = jwt.verify(token, SECRET_KEY);
  if (
    typeof parsedToken !== "object" ||
    parsedToken === null ||
    typeof parsedToken.userId !== "number"
  ) {
    console.log("token payload invalid", parsedToken);
    return;
  }
  try {
    return await Employee.get(parsedToken.userId);
  } catch (e) {
    console.log("failure reading employee", e);
    return;
  }
}

/** Middleware to use when employee is active
 *
 * if not raise Unauthorized
 */

async function ensureUser(req, res, next) {
  try {
    const employee = await getEmployeeForToken(req);
    if (employee) {
      const role = employee.role;
      if (role === "user" || role === "manager" || role === "admin") {
        return next();
      }
    }

    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}

/**Middleware to use when they need to be logged in as manager
 *
 * if not, raises Unauthorized
 */

async function ensureManager(req, res, next) {
  try {
    const employee = await getEmployeeForToken(req);
    if (employee) {
      const role = employee.role;
      if (role === "manager" || role === "admin") {
        return next();
      }
    }

    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}

/**Middleware to use when they need to be logged in as admin user
 *
 * if not, raises Unauthorized
 */

async function ensureAdmin(req, res, next) {
  try {
    const employee = await getEmployeeForToken(req);
    if (employee) {
      const role = employee.role;
      if (role === "admin") {
        return next();
      }
    }

    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  ensureUser,
  ensureAdmin,
  ensureManager,
};
