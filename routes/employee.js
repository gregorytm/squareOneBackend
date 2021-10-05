"use strict";

/** Routes for employees */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Employee = require("../models/employee");
const { createToken } = require("../helperFunctions/tokens");
const employeeNewSchema = require("../schemas/employeeNew.json");
const employeeUpdateSchema = require("../schemas/employeeUpdate.json");
const {
  ensureLoggedIn,
  authenticateJWT,
  ensureActive,
  ensureAdmin,
  ensureManager,
} = require("../middleware/auth");

const router = express.Router();

/** POST / { employee } => { employee, token }
 *
 * Adds a new user.  THis is no the registration endpoint --- instead this is
 * only for admin users to add new users.  The new employee being added can be an
 * admin.
 *
 * This returns the newwly created employee and an authentication token for them:
 *  {employee: { username, firstInital, lastName statis}, token}
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const employee = await Employee.register(req.body);
    const token = createToken(employee);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/**GET / => { employees: [ {username, firstInital, lastName, status}, ..] }
 *
 * Returns list of all users.
 *
 * Authorization required: manager
 */

router.get("/:username", ensureManager, async function (req, res, next) {
  try {
    const employee = await User.get(req.params.username);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { employee } => { employee }
 *
 * Data can include:
 *  { firstInital, lastName, password, email }
 *
 * Returns { username, firstInital}
 */

router.patch("./:username", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const employee = await Employee.update(req.params.username, req.body);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username] => { deleted: username }
 *
 * Authorization required: admin
 */

router.delete("/:username", ensureAdmin, async function (req, res, next) {
  try {
    await Employee.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
