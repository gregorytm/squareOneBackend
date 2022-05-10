"user strict";

/** routes for projects. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Project = require("../models/project");
const Chamber = require("../models/chamber");
const Dehu = require("../models/dehu");
const Material = require("../models/material");
const Reading = require("../models/reading");

const projectNewSchema = require("../schemas/projectNewSchema.json");
const projectUpdateSchema = require("../schemas/projectUpdateSchema.json");
const projectSearchSchema = require("../schemas/projectSearchSchema.json");

const router = new express.Router({ mergeParams: true });

/** POST /new => { project }
 *
 * project should be { insured_name, address, created_at, active }
 *
 * Returns { id, insured_Name, address, created_at, active }
 *
 * Authorization required: active manager
 */

router.post("/new", ensureManager, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, projectNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const project = await Project.create(req.body);
    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
});

/** GET {projects} => { projects}
 *
 * returns { id, insured_name, address, created_at, active}
 *
 * auth required: active status
 */

router.get("/", ensureUser, async function (req, res, next) {
  try {
    const projects = await Project.findActive();
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
});

/** Get /[projId] => { project }
 *
 * Returns { insuredName, address, created_at }
 *
 * authorization requird: active statis
 */
router.get("/:projId", ensureUser, async function (req, res, next) {
  try {
    const project = await Project.get(req.params.projId);
    return res.json({ project });
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
 * Authorization required: ensureUser
 */

//TODO: impliment patching of projects & readings
// router.patch("/:id", ensureManager, async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, projectUpdateSchema);
//     if(!validator.valid) {
//       const errs = validator.errosmap(e => e.stack);
//       throw new BadRequestError(errs);
//     }
//     const company = await Project.
//   }
// });

/** DELETE /[id] => { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureManager, async function (req, res, next) {
  try {
    await Project.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

/** GENERATE REPORTS related to each project( chamber, dehu, affectedMaterial) */

/** GET/=>
 * {chambers: [{id, chamberName, projectId }, ...]}
 * {chamberReading: [{id, chamber_id, temp, RH, mosistureContent, readingDate, dayNumber}]}
 *
 * Authorization require: active
 */

router.get("/:projectId/readings/chamber", async function (req, res, next) {
  try {
    const chambers = await Chamber.getReports(req.params.projectId);
    return res.json({ chambers });
  } catch (err) {
    return next(err);
  }
});

/** GENERATE REPORTS related to dehus */

/** GET/=>
 * {dehus: [{dehuId, dehuNumber, temp, RH, readingDate, dayNumber }, ...]}
 * {dehuReading: [{ dehuId, temp, RH, readingDate, dayNumber}]}
 *
 * Authorization require: manager
 */

router.get("/:projectId/readings/dehu", async function (req, res, next) {
  try {
    const dehus = await Dehu.getReports(req.params.projectId);
    return res.json({ dehus });
  } catch (err) {
    return next(err);
  }
});

/** GENERATE REPORTS related to materials */

/** GET/=>
 * {materials: [{materialId, materialName, moistureContent, readingDate, dayNumber }, ...]}
 * {dehuReading: [{ materialName, moistureConetent, readingDate, dayNumber}]}
 *
 * Authorization require: manager
 */

router.get("/:projectId/readings/materials", async function (req, res, next) {
  try {
    const materials = await Material.getReports(req.params.projectId);
    return res.json({ materials });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
