const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

const CATEGORY_PATH = path.join(__dirname, "category");

// ensure category folder exists
if (!fs.existsSync(CATEGORY_PATH)) {
  fs.mkdirSync(CATEGORY_PATH);
}

// middlewares
// app.use(express.static("public"));
app.use(express.static(__dirname));
app.use("/category", express.static(CATEGORY_PATH));
app.use(express.json());

/* =========================
   📦 MULTER CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CATEGORY_PATH); // temp save
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    if (!req.uploadId) {
      req.uploadId = Date.now();
    }

    if (file.fieldname === "preview") {
      cb(null, `${req.uploadId}-preview${ext}`);
    } else {
      cb(null, `${req.uploadId}-full${ext}`);
    }
  }
});

const upload = multer({ storage });

/* =========================
   📡 API: GET DATA
========================= */

app.get("/api/data", (req, res) => {
  let result = {};

  const folders = fs.readdirSync(CATEGORY_PATH);

  folders.forEach(folder => {
    const folderPath = path.join(CATEGORY_PATH, folder);

    if (!fs.lstatSync(folderPath).isDirectory()) return;

    const files = fs.readdirSync(folderPath);

    // ✅ ONLY SEND PREVIEW FILES
    result[folder.toLowerCase()] = files.filter(f =>
      f.includes("-preview")
    );
  });

  res.json(result);
});

/* =========================
   ⬆️ UPLOAD ROUTE
========================= */

app.post(
  "/upload",
  upload.fields([
    { name: "preview" },
    { name: "full" }
  ]),
  (req, res) => {

    let category = req.body.category;

    if (!category || category === "undefined") {
      category = "default";
    }

    category = category.toLowerCase();

    const dir = path.join(CATEGORY_PATH, category);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const files = req.files;

    Object.values(files).forEach(arr => {
      arr.forEach(file => {
        const newPath = path.join(dir, file.filename);
        fs.renameSync(file.path, newPath);
      });
    });

    // save metadata
    const dataPath = path.join(__dirname, "data.json");

    let data = {};
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath));
    }

    const previewFile = req.files.preview[0].filename;

    data[previewFile] = {
      category: category,
      description: req.body.description || ""
    };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    res.send("Uploaded 🔥");
  }
);

/* =========================
   🚀 START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});