const Express = require("express");
const router = Express.Router();
const Middleware = require("../middleware");
const fs = require("fs");
const files = require("../libs/files");
const { applyAssSubtitles, saveAssSubtitles } = require("../libs/ffmpeg");
const multer = require("multer");


const upload = multer();
router.post("/:id", upload.none(), ...Middleware, async (req, res) => {
    const { id } = req.params;
    if (!id || id.length !== 32) {
        return res.status(400).json({ error: "invalid_file_id" });
    }

    const assBuffer = req.body && req.body.assBuffer ? req.body.assBuffer : null;
    if (!assBuffer) {
        return res.status(400).json({ error: "missing_ass_buffer" });
    }

    const ass = Buffer.from(assBuffer, "base64").toString("utf-8");
    const videoPath = files.tmpPath(id, ".mp4");
    const audioPath = files.tmpPath(id, ".wav");

    const assPath = await saveAssSubtitles(files.tmpPath(id, ".ass"), ass);

    await applyAssSubtitles(videoPath, audioPath, assPath, files.tmpPath(id, "_final.mp4"));
    await files.cleanFiles([videoPath, audioPath, assPath]);
    res.json({ success: true, id });
});

module.exports = router;