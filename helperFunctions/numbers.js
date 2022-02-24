function parseInt(text) {
  const int = Number.parseInt(text);
  if (Number.isNaN(int)) {
    throw new Error(`"${text}" can not be parsed as a intenger`);
  }
  return int;
}

module.exports = { parseInt };
