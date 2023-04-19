//Run this file, not app.js
const app = require("./app");
const port = process.env.PORT || 3001;

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`app listening on port ${port}`));
