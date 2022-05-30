"user strict";

/** routes for projects. */
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureUser, ensureManager } = require("../middleware/auth");
const Project = require("../models/project");
const Chamber = require("../models/chamber");
const Dehu = require("../models/dehu");
const Material = require("../models/material");

const jsonschema = require("jsonschema");
const projectNewSchema = require("../schemas/projectNewSchema.json");
const projectUpdateSchema = require("../schemas/projectUpdateSchema.json");

const router = new express.Router({ mergeParams: true });

/** GET {projects} => { projects}
 *
 * returns { id, insuredName, address, createdAt, active}
 *
 * auth required: active
 */

router.get("/", ensureUser, async function (req, res, next) {
  try {
    const projects = await Project.findActive();
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
});

/** GET /[projId] => { project }
 *
 * returns { insuredName, address, created_at }
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

/** POST /new => { project }
 *
 * requires { insuredName, address, createdAt, active }
 *
 * returns { id, insuredName, address, createdAt, active }
 *
 * authorization required: active manager
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

/** PATCH /[id] { fld1, fld2, ...} => { project}
 *
 * fields can be: [ { insuredName, address, createdAt, active }
 *
 * feturns { insuredName, address, createdAt, active }
 *
 * authorization required: ensureUser
 */

router.patch("/:id/update", ensureManager, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, projectUpdateSchema);
    if (!validator.valid) {
      const errs = validator.erros.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const project = await Project.update(req.params.id, req.body);
    return res.json({ project });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] => { deleted: id }
 *
 * authorization: admin
 */

router.delete("/:id", ensureManager, async function (req, res, next) {
  try {
    await Project.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

//TODO: move these routes to a new file
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
