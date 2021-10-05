"use strict";

//middleware to handle common auth cases in routes

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user
 *
 * If a token was provided, verify it, and if valid, store the token playload
 * on res.locals (this will include the username and status field)
 *
 * It's not an error if no token was provided or if token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.header && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
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
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (e) {
    return next(e);
  }
}

/** Middleware to use when they must have certin access
 *
 * if not raise Unauthorized
 */

function ensureActive(req, res, next) {
  if (!req.user || !req.user.status !== "employee") {
    const e = new ExpressError("Unauthorized", 401);
    return next(e);
  } else {
    return next();
  }
}

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.status !== "manager") {
    return next(new ExpressError("Must be an admin", 401));
  }
  return next();
}

function ensureManager(req, res, next) {
  if (!req.user || req.user.status !== "admin") {
    return next(new ExpressError("Must be a manager", 401));
  }
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureActive,
  ensureAdmin,
  ensureManager,
};
