const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "tmp";
const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB
const ALLOWED_TYPES = ["video/mp4", "video/mov", "video/quicktime", "video/x-matroska"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const id = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalname);
        cb(null, `${id}${ext}`);
    }
})

const filter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file mimetype"), false);
}

module.exports = {
    upload: multer({
        storage,
        fileFilter: filter
    }),
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    UPLOAD_DIR
}