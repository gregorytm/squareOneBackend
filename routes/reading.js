const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const { isDefinedNumber } = require("../helperFunctions/isDefinedNumber");
const {
  ensureUser,
  ensureManager,
  ensureAdmin,
} = require("../middleware/auth");

//TODO: delete this entire page?  Reading functionality is on the corrisponding route node, eg: dehus, chambers, materials

// new

router.post("/new", ensureUser, async (req, res, next) => {
  try {
    const {
      chamber_id,
      dehu_id,
      material_id,
      temp,
      RH,
      moisture_content,
      reading_date,
      day_number,
    } = req.body;
    if (!chamber_id && !dehu_id && !material_id) {
      throw new ExpressError("id's incorrect", 400);
    } else if (
      isDefinedNumber(temp, RH, moisture_content, day_number) &&
      !reading_date
    ) {
      throw new ExpressError("all readings data required", 400);
    }
    const results = await db.query(
      `INSERT INTO reading (chamber_id, dehu_id, material_id, temp, RH, 
        moisture_content, reading_date, day_number) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING temp, RH, moisture_content`,
      [
        chamber_id,
        dehu_id,
        material_id,
        temp,
        RH,
        moisture_content,
        reading_date,
        day_number,
      ]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//update reading
router.patch("/:id", ensureManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      chamber_id,
      dehu_id,
      material_id,
      temp,
      RH,
      moisture_content,
      reading_date,
      day_number,
    } = req.body;
    const results = await db.query(
      "UPDATE reading SET chamber_id=$1, dehu_id=$2, material_id=$3 temp=$4, RH=$5, moisture_content=$6, readings_date=$7, day_number=$8 WHERE id=$ 9RETURNING temp, RH",
      [
        (chamber_id,
        dehu_id,
        material_id,
        temp,
        RH,
        moisture_content,
        reading_date,
        day_number),
      ]
    );
    return res.send(results.rows[0]);
  } catch (e) {
    return next(e);
  }
});

//delete reading
router.delete("/id", ensureManager, async (req, res, next) => {
  const { id } = req.params;
  try {
    const results = db.query("DELETE FROM reading WHERE id=$1", [
      req.params.id,
    ]);
    return (res.send = { msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
