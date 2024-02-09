let express = require("express");

let app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});
app.get("/version", (req, res) => {
  res.send("v3");
});

app.listen(8001);
