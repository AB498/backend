let express = require("express");

let app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/version", (req, res) => {
  res.send("v3");
});

// host 0.0.0.0
let port = 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on http://localhost:${port}`);
});
