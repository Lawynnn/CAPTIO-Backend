const fs = require("fs");
const path = require("path");

module.exports.getFileExtension = (filePath) => {
    return path.extname(filePath).toLowerCase();
}

module.exports.getFileNameWithoutExtension = (filePath) => {
    return path.basename(filePath, path.extname(filePath));
}

module.exports.getPathWithoutFileName = (p) => {
    return path.dirname(p);
}

module.exports.cleanFiles = async (filePaths) => {
    filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
}

module.exports.saveTranscription = async (transcription) => {
    // overwrite debug file
    const outputPath = `debug/transcription.json`;
    fs.writeFileSync(outputPath, JSON.stringify(transcription, null, 2));
}

module.exports.loadTranscription = async () => {
    const inputPath = `debug/transcription.json`;
    if (!fs.existsSync(inputPath)) {
        throw new Error("Transcription debug file not found");
    }
    const data = fs.readFileSync(inputPath, "utf-8");
    return JSON.parse(data);
}