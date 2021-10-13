"use strict";

//middleware to handle common auth cases in routes

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate employee
 *
 * If a token was provided, verify it, and if valid, store the token playload
 * on res.locals (this will include the id, username and status field)
 *
 * It's not an error if no token was provided or if token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.header && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.employee = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (e) {
    return next();
  }
}

/**Middlware to use when they must be logged in
 *
 * If not, raise Unauthroized
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.employee) throw new UnauthorizedError();
    return next();
  } catch (e) {
    return next(e);
  }
}

/** Middleware to use when employee is active
 *
 * if not raise Unauthorized
 */

function ensureActive(req, res, next) {
  try {
    if (
      !req.locals.employee ||
      !req.employee.status !== "active" ||
      !req.employee.status !== "manager" ||
      !req.employee.status !== "admin"
    ) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/**Middleware to use when they need to be logged in as admin user
 *
 * if not, raises Unauthorized
 */

function ensureAdmin(req, res, next) {
  try {
    if (!req.user || req.user.status !== "admin") {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/**Middleware to use when they need to be logged in as manager
 *
 * if not, raises Unauthorized
 */

function ensureManager(req, res, next) {
  try {
    if (
      !req.user ||
      req.user.status !== "admin" ||
      req.user.status !== "manager"
    ) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectEmployeeOrManagement(req, res, next) {
  try {
    const user = res.locals.employee;
    console.log("1", res.locals);
    if (
      !(user && (user.ensureManager || user.username === req.params.username))
    ) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureActive,
  ensureAdmin,
  ensureManager,
  ensureCorrectEmployeeOrManagement,
};
