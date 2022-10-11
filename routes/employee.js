"use strict";

/** Routes for employees */
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureManager } = require("../middleware/auth");
const Employee = require("../models/employee");
const { createToken } = require("../helperFunctions/tokens");

const jsonschema = require("jsonschema");
const employeeNewSchema = require("../schemas/employeeNew.json");
const employeeUpdateSchema = require("../schemas/employeeUpdate.json");

const router = express.Router();

/**GET /{employees} => {employee}
 *
 * gets a list of all employees for admin
 *
 * auth required Admin
 */

router.get("/personnel", ensureAdmin, async function (req, res, next) {
  try {
    const employees = await Employee.getAll();
    return res.json({ employees });
  } catch (err) {
    return next(err);
  }
});

/**GET /[userId] => { employees}
 *
 * Returns { username, username, firstInital, lastName, status}.
 *
 * Authorization required: manager or admin
 */

router.get("/:userId", async function (req, res, next) {
  console.log("test test");
  try {
    const employee = await Employee.get(req.params.userId);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

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

/** PATCH /[username] { employee } => { employee }
 *
 * Data can include:
 *  { firstInital, lastName, password, email }
 *
 * Returns { username, firstInital}
 */

router.patch("/:empId/update", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const employee = await Employee.update(req.params.empId, req.body);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/**PATCH /[empId]/manager
 *
 * promotes user to manager
 *
 * Authorization required: admin
 */

router.patch("/:empId/manager", ensureAdmin, async function (req, res, next) {
  try {
    const employee = await Employee.promoteToManager(req.params.empId);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/**PATCH /[empId]/user
 *
 * promotes null to user
 *
 * Authorization required: admin
 */

router.patch("/:empId/user", ensureAdmin, async function (req, res, next) {
  try {
    const employee = await Employee.promoteToUser(req.params.empId);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /[empId]/unactive
 *
 * set employee as unactive
 *
 * authorazion required: admin
 */

router.patch("/:empId/unactive", ensureAdmin, async function (req, res, next) {
  try {
    const employee = await Employee.makeUnactive(req.params.empId);
    return res.json({ employee });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[empId] => { deleted: username }
 *
 * Authorization required: admin
 */

router.delete("/:empId", ensureAdmin, async function (req, res, next) {
  try {
    await Employee.remove(req.params.empId);
    return res.json({ deleted: req.params.empId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
