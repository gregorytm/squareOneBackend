const { BadRequestError } = require("../expressError");

/**
 * Helper for making selective update queries.
 *
 * The classing function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal,...}
 * @param jsToSql {Object} maps js-style data fieleds to database column names,
 * like {firstName}; "first_name", age: "age"
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstInital: "A", last_name: Smith} =>
 * { setCols: '"first_inital"=1, "last_name"=$2',
 * values: ['A', 'Smith] }
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //{firstInital: 'Aliya', age:32} => ['"first_inital"=$1', '"age"=$2']
  const cols = keys.map(
    (colFirstInit, idx) => `"${jsToSql[colName || colFirstInit]}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
