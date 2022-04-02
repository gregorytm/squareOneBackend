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

/** POST { project } => { project }
 *
 * project should be { insured_name, address, created_at, active }
 *
 * Returns { id, insured_Name, address, created_at, active }
 *
 * Authorization required: admin
 */

router.post("/new", ensureManager, async function (req, res, next) {
  try {
    const project = await Project.create(req.body);
    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
});

router.get("/", ensureUser, async function (req, res, next) {
  const q = req.query;
  //arrive as strings from querystring
  try {
    const validator = jsonschema.validate(q, projectSearchSchema);
    if (!validator.valid) {
      const projects = await Project.findActive();
      return res.json({ projects });
      // const errs = valid.errors.map((e) => e.stack);
      // throw new BadRequestError(errs);
    }

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

router.get("/:projId/chambers", ensureUser, async function (req, res, next) {
  try {
    const chambers = await Chamber.findRelated(req.params.projId);
    return res.json({ chambers });
  } catch (err) {
    return next(err);
  }
});

//TODO: determain auth required
router.post(
  "/:projId/chamber/new",
  ensureUser,
  async function (req, res, next) {
    try {
      const chamber = await Chamber.create(req.body, req.query);
      return res.status(201).json({ chamber });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:projId/chamber/:chamberId",
  ensureUser,
  async function (req, res, next) {
    try {
      const chamber = await Chamber.get(req.params.chamberId);
      return res.json({ chamber });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/projId/chamber/:chamberId/dehu/new",
  ensureUser,
  async function (req, res, next) {
    try {
      const dehu = await Dehu.create(req.body);
      return res.status(201).json(dehu);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:projId/chamber/:chamberId/material",
  ensureUser,
  async function (req, res, next) {
    try {
      const material = await Material.findRelated(req.params.chamberId);
      return res.json({ material });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:projId/chamber/:chamberId/material/:materialId",
  ensureManager,
  async function (req, res, next) {
    try {
      const material = await Reading.findMaterialReadings(
        req.params.materialId
      );
      return res.json({ material });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:projId/chamber/:chamberId/dehu/:dehuId",
  ensureManager,
  async function (req, res, next) {
    try {
      const dehuReadings = Reading.findDehuReadings(req.params.dehuId);
      return res.json({ dehuReadings });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:projId/chamber/:chamberId/readings",
  ensureManager,
  async function (req, res, next) {
    try {
      const chamberReadings = await Reading.findChamberReadings(
        req.params.chamberId
      );
      return res.json({ chamberReadings });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/:projId/chamber/:chamberId/reading",
  ensureUser,
  async function (req, res, next) {
    try {
      const reading = await Reading.create(req.body);
      return res.status(201).json({ reading });
    } catch (err) {
      return next(err);
    }
  }
);

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
router.patch("/:id");

router.get("/", ensureUser, async function (req, res, next) {
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

router.delete("/:id", async function (req, res, next) {
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
