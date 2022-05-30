"use strict";

/** imports for authentication */
const jsonschema = require("jsonschema");

const Employee = require("../models/employee");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helperFunctions/tokens");
const employeeAuthSchema = require("../schemas/employeeAuth.json");
const employeeRegisterSchema = require("../schemas/employeeRegister.json");
const { BadRequestError } = require("../expressError");

/** routes for authentication */

/**POST /auth/token: { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests
 *
 * Authorization rqured: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const employee = await Employee.authenticate(username, password);
    const token = createToken(employee);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register: { employee } => { token }
 *
 * employee must include { username, first_inital, last_name, password }
 *
 * Returns JWT token which can be used to authenticate futher requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, employeeRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const newEmployee = await Employee.register({
      ...req.body,
      role: null,
    });
    const token = createToken(newEmployee);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
