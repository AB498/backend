let express = require("express");
let fs = require("fs");
let path = require("path");

let app = express();

const directoryPath = "./static";

app.use("/", express.static(directoryPath));

app.get("/version", (req, res) => {
  res.send("v6");
});

app.get("/api/filesInfo", (req, res) => {
  // Function to get last edited time for each file recursively
  const result = {};
  function getLastEditedTimes(dir, baseDir = "/") {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach((file) => {
      const relativePath = path.join(baseDir, file.name); // Relative path calculation
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        getLastEditedTimes(filePath, relativePath);
      } else {
        const stats = fs.statSync(filePath);
        const lastEditedTime = stats.mtime; // Last modified time
        result[relativePath] = lastEditedTime;
      }
    });
    for (const [key, value] of Object.entries(result)) {
      const formattedPath = key.split(path.sep).join(path.posix.sep);
      delete result[key];
      result[formattedPath] = value;
    }

    return result;
  }

  const lastEditedTimes = getLastEditedTimes(directoryPath);
  res.json(lastEditedTimes);
});

app.get("*", (req, res) => {
  //spa
  res.sendFile(__dirname + "/static/index.html");
});

// host 0.0.0.0
let port = 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on http://localhost:${port}`);
});
