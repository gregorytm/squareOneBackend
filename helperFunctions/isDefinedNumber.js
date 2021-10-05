function isDefinedNumber(temp, RH, MC, day) {
  const inputs = [temp, RH, MC, day];
  for (const reading of inputs) {
    reading && reading !== 0;
  }
}

module.exports = { isDefinedNumber };
