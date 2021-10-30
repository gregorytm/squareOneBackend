const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

//new dehumidifier
router.post("/new", async (req, res, next) => {
  try {
    const { dehu_number, chamber_id, location } = req.body;
    if (!dehu_number || !chamber_id || !location) {
      throw new ExpressError("all dehumidifier fields are required", 400);
    }
    const results = await db.query(
      `INSERT INTO dehumidifier (dehu_number, chamber_id, location) VALUES ($1, $2, $3) RETURNING dehu_number, chamber_id, loacation`,
      [dehu_number, chamber_id, location]
    );
    return res.json(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//update dehu
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dehu_number, chamber_id, location } = req.body;
    const results = await db.query(
      "UPDATE projects SET dehu_number=$1, chamer_id=$2, location=$3 WHERE id=$5 RETURNING dehu_number, chamber_id, location",
      [{ dehu_number, chamber_id, location }]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = db.query("DELETE FROM dehumidifier WHERE id =$1", [
      req.params.id,
    ]);
    return (res.send = { msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
