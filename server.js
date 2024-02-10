let express = require("express");

let app = express();

app.use("/", express.static("/static"));

app.get("/", (req, res) => {
  res.send("Hello World 4");
});
app.get("/version", (req, res) => {
  res.send("v4");
});

// host 0.0.0.0
let port = 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on http://localhost:${port}`);
});
