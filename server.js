const jwt = require("jsonwebtoken");
const models = require("./models");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const multer = require("multer");

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      cb(null, uuid() + path.extname(file.originalname));
    },
  }),
});

let app = express();

const directoryPath = "./static";

if (!fs.existsSync(__dirname + "/uploads")) fs.mkdirSync(__dirname + "/uploads");
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/", express.static(directoryPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost", "http://127.0.0.1", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:5173"], // 5173 is the vite dev server port
    credentials: true,
  })
);
app.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err);
  res.status(500).json({ message: err.message, stack: err.stack });
});
app.get("/version", (req, res) => {
  res.send("v8");
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

crudSubjects = ["User", "Product"];

for (let subject of crudSubjects) {
  const model = models[subject];
  const router = express.Router();
  router.get("/", async (req, res) => res.json(await model.findAll({})));
  router.get("/:id", async (req, res) => res.json(await model.findOne({ where: { id: req.params.id } })));
  router.post("/", upload.array("files", 10), parseFormDataBody, async (req, res) => {
    // console.log('files', req.files.map(i => i.filename));
    console.log("files", req.body);
    let processedFiles = req.files.map(processFileForFileName);
    const newItem = new model({
      ...req.body,
      avatar: processedFiles[0],
      images: processedFiles,
    });
    let added = (await newItem.save()).get({ plain: true });
    // console.log('added', added);
    res.json(added);
  });

  router.patch("/:id", async (req, res) => {
    const updated = await model.update(req.body, { where: { id: req.params.id } });
    res.json(updated);
  });

  router.get("/reset", async (req, res) => {
    const deleted = await model.destroy({ where: {} });
    res.json(deleted);
  });
  router.delete("/", async (req, res) => {
    const deleted = await model.destroy({ where: {} });
    res.json(deleted);
  });
  router.delete("/:id", async (req, res) => {
    const deleted = await model.destroy({ where: { id: req.params.id } });
    res.json(deleted);
  });
  app.use(`/api/${subject.toLowerCase()}`, router);
}

function processFileForFileName(file) {
  // rename file to date.now
  let name = `/uploads/${Date.now()}-${file.originalname}`;
  fs.renameSync(file.path, "." + name);
  return name;
}
function parseFormDataBody(req, res, next) {
  req.body = JSON.parse(req.body.bodyString || "{}");
  next();
}

app.post("/api/auth/register", async (req, res) => {
  if (!req.body.email || !req.body.password) return res.status(401).json({ message: "All fields not provided" });
  let fetchedUser = await models.User.findOne({ where: { email: req.body.email || null } });
  if (fetchedUser) return res.status(401).json({ message: "User already exists" });
  let user = new models.User(req.body);
  user.jwts = [jwt.sign({ id: user.id, email: user.email }, "secret")];
  try {
    await user.save();
  } catch (err) {
    console.log(err);
  }
  return res.json(user);
});

app.post("/api/auth/login", async (req, res) => {
  if (!req.body.email || !req.body.password) return res.status(401).json({ message: "All fields not provided" });
  let fetchedUser = await models.User.findOne({ where: { email: req.body.email || null } });
  if (!fetchedUser) return res.status(401).json({ message: "User not found" });
  if (fetchedUser.password != req.body.password) return res.status(401).json({ message: "Invalid credentials" });
  let user = { ...fetchedUser, jwts: [...user.jwts, jwt.sign({ id: fetchedUser.id, email: user.email }, "secret")] };
  return res.json(user);
});

app.get("*", (req, res) => {
  //spa
  res.sendFile(__dirname + "/static/index.html");
});

// host 0.0.0.0
let port = 8000;
(async () => {
  await models.init();
  app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
})();
