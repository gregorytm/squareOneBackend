"user strict";

/** routes for projects. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const {
  ensureActive,
  ensureManager,
  ensureAdmin,
} = require("../middleware/auth");
const Project = require("../models/project");

const projectNewSchema = require("../schemas/projectNewSchema.json");
const projectUpdateSchema = require("../schemas/projectUpdateSchema.json");
const projectSearchSchema = require("../schemas/projectSearchSchema.json");

const router = new express.Router();

/** POST { project } => { project }
 *
 * project should be { insured_name, address, created_at, active }
 *
 * Returns { id, insured_Name, address, created_at, active }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.boyd, projectNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const project = await Project.create(req.body);
    return res.status(201).json({ project });
  } catch (err) {
    return next(errs);
  }
});

/** GET /=>
 * {projects: [ { id, insuredName, address, createadAt, active }, ...] logoUrl ] }
 *
 * can filter on provided search filters:
 * - address
 * - created_at
 * - active
 *
 * Authorization required: ensureActive
 */

/**Get /[id] => { project }
 *
 * Project is { id, insuredName, address, createAt, active}
 */
router.get("/:id", ensureActive, async function (req, res, next) {
  try {
    const project = await Project.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** Patch /[id] { fld1, fld2, ...} => { project}
 *
 * Patches project data
 *
 * fields can be: [ { insuredName, address, createdAt, active }
 *
 * Feturns { insuredName, address, createdAt, active }
 *
 * Authorization required: ensureActive
 */

router.patch("/:id");

router.get("/", async function (req, res, next) {
  const q = req.query;
  //arrive as strings from querystring, but we want as ints

  try {
    const validator = jsonschema.validator(q, projectSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const projects = await Project.findAll(q);
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id}
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Project.remove(req.params.id);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;