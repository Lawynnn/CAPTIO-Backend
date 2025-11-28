const Express = require('express');
const router = Express.Router();
const Middleware = require('../middleware');
const { upload, MAX_FILE_SIZE } = require("../libs/multer");
const { convertToAudio, saveAssSubtitles, applyAssSubtitles } = require("../libs/ffmpeg");
const subtitles = require("../subtitles");
const { transcribeAudio } = require("../libs/whisper");

const files = require("../libs/files");

router.post("/", ...Middleware, upload.single("video"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "no_file_uploaded" });
    }

    if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "file_too_large", max_size: MAX_FILE_SIZE, actual_size: req.file.size });
    }

    if (!req.body.template) {
        return res.status(400).json({ error: "no_template_specified" });
    }

    const validTemplates = subtitles.getValidTemplates();
    if (!validTemplates.includes(req.body.template)) {
        return res.status(400).json({ error: "invalid_template", valid_templates: validTemplates });
    }

    const audioConversion = await convertToAudio(req.file.path).catch(err => {
        return { error: "audio_conversion_failed", details: err.message };
    })

    if (audioConversion.error) {
        return res.status(500).json(audioConversion);
    }

    // const transcription = [
    //     { word: 'cu', start: 0.6600000262260437, end: 1.2200000286102295 },
    //     { word: 'un', start: 1.2200000286102295, end: 1.5800000429153442 },
    //     {
    //         word: 'prieten',
    //         start: 1.5800000429153442,
    //         end: 1.7400000095367432
    //     },
    //     { word: 'nou', start: 1.7400000095367432, end: 2.4200000762939453 },
    //     { word: 'pe', start: 2.4200000762939453, end: 2.5999999046325684 },
    //     { word: 'care', start: 2.5999999046325684, end: 2.700000047683716 },
    //     { word: 'mi', start: 2.700000047683716, end: 2.859999895095825 },
    //     { word: 'l', start: 2.859999895095825, end: 2.9000000953674316 },
    //     { word: 'am', start: 2.9000000953674316, end: 2.9600000381469727 },
    //     { word: 'facut', start: 2.9600000381469727, end: 3.240000009536743 },
    //     { word: 'il', start: 3.4000000953674316, end: 3.5 },
    //     { word: 'cunoastesc', start: 3.5, end: 3.9600000381469727 },
    //     { word: 'pe', start: 3.9600000381469727, end: 4.199999809265137 },
    //     { word: 'Ciprian', start: 4.199999809265137, end: 4.5 },
    //     { word: 'Lepădatu', start: 4.5, end: 5.159999847412109 },
    //     { word: 'Ciprian', start: 5.840000152587891, end: 5.960000038146973 },
    //     { word: 'cum', start: 6.119999885559082, end: 6.119999885559082 },
    //     { word: 'se', start: 6.119999885559082, end: 6.21999979019165 },
    //     { word: 'numește', start: 6.21999979019165, end: 6.420000076293945 },
    //     {
    //         word: 'asociația',
    //         start: 6.420000076293945,
    //         end: 6.960000038146973
    //     },
    //     { word: 'ta', start: 6.960000038146973, end: 7.21999979019165 },
    //     { word: 'în', start: 7.21999979019165, end: 7.619999885559082 },
    //     {
    //         word: 'Constanța',
    //         start: 7.619999885559082,
    //         end: 8.079999923706055
    //     },
    //     {
    //         word: 'Asociația',
    //         start: 8.579999923706055,
    //         end: 8.880000114440918
    //     },
    //     { word: 'se', start: 8.880000114440918, end: 9 },
    //     { word: 'numește', start: 9, end: 9.319999694824219 },
    //     { word: 'evident', start: 9.4399995803833, end: 9.880000114440918 },
    //     {
    //         word: 'Asociația',
    //         start: 10.15999984741211,
    //         end: 10.5600004196167
    //     },
    //     {
    //         word: 'Firmelor',
    //         start: 10.5600004196167,
    //         end: 10.859999656677246
    //     },
    //     {
    //         word: 'Constanței',
    //         start: 10.859999656677246,
    //         end: 11.239999771118164
    //     }
    // ]

    const dir = files.getPathWithoutFileName(req.file.path);
    const fileName = files.getFileNameWithoutExtension(req.file.path);

    const transcription = await transcribeAudio(audioConversion.mp3Path).catch(err => {
        return { error: "transcription_failed", details: err.message };
    })

    if (transcription.error) {
        return res.status(500).json(transcription);
    }

    const ass = await subtitles.generate(req.body.template, transcription);
    const assOutputPath = await saveAssSubtitles(req.file.path, ass);


    const finalOutputPath = `${dir}/${fileName}_final.mp4`;
    await applyAssSubtitles(req.file.path, audioConversion.mp3Path, assOutputPath, finalOutputPath);

    await files.cleanFiles([req.file.path, audioConversion.mp3Path, assOutputPath]);

    res.status(200).json({
        message: "file_uploaded_successfully", id: `${fileName}`
    });
})

module.exports = router;