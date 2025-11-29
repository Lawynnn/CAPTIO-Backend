const Express = require("express");
const router = Express.Router();
const Middleware = require("../middleware");
const { upload, MAX_FILE_SIZE } = require("../libs/multer");
const subtitles = require("../subtitles");
const { convertToAudio } = require("../libs/ffmpeg");
const { transcribeAudio } = require("../libs/whisper");
const files = require("../libs/files");
const { unlinkSync } = require("fs");

require("dotenv").config();

router.post("/", ...Middleware, upload.single("video"), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: "no_file_uploaded" });
    }

    if (req.file.size > MAX_FILE_SIZE) {
        unlinkSync(req.file.path);
        return res.status(400).json({ error: "file_too_large", max_size: MAX_FILE_SIZE, actual_size: req.file.size });
    }

    if (!req.body.template) {
        unlinkSync(req.file.path);
        return res.status(400).json({ error: "no_template_specified" });
    }

    const validTemplates = subtitles.getValidTemplates();
    if (!validTemplates.includes(req.body.template)) {
        unlinkSync(req.file.path);
        return res.status(400).json({ error: "invalid_template", valid_templates: validTemplates });
    }

    const audioConversion = await convertToAudio(req.file.path).catch(err => {
        return { error: "audio_conversion_failed", details: err.message };
    })

    if (audioConversion.error) {
        return res.status(500).json(audioConversion);
    }

    const fileName = files.getFileNameWithoutExtension(req.file.path);

    const transcription = await transcribeAudio(audioConversion.mp3Path).catch(err => {
        return { error: "transcription_failed", details: err.message };
    })

    if (transcription.error) {
        return res.status(500).json(transcription);
    }

    // const transcription = await files.loadTranscription();

    const overrideConfig = {};
    for (const key in req.body) {
        if (key.startsWith("c.")) {
            const configKey = key.slice(2);
            overrideConfig[configKey] = req.body[key];
        }
    }

    const ass = await subtitles.generate(req.body.template, transcription, overrideConfig);

    res.status(200).json({
        message: "file_uploaded_successfully", id: `${fileName}`, ass: Buffer.from(ass, "utf-8").toString("base64")
    });
});

module.exports = router;