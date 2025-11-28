const Express = require('express');
const router = Express.Router();
const Middleware = require('../middleware');
const fs = require("fs");
const { UPLOAD_DIR } = require("../libs/multer");
require('dotenv').config();

router.get("/:fileId", ...Middleware, async (req, res) => {
    const fileId = req.params.fileId;
    if(!fileId || fileId.length !== 32) {
        return res.status(400).json({ error: "invalid_file_id" });
    }

    const filePath = `${UPLOAD_DIR}/${fileId}_final.mp4`;
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "file_not_found" });
    }

    res.download(filePath);
});

module.exports = router;