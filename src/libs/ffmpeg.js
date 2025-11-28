const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const files = require("./files");

module.exports.convertToAudio = async (inputPath) => {
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(path.dirname(inputPath), `${fileName}.mp3`);

    const cmd = `ffmpeg -i "${inputPath}" -vn -acodec libmp3lame -ab 192k "${outputPath}"`;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve({
                mp3Path: outputPath,
                mp4Path: inputPath
            });
        });
    })
}

// inputFile: tmp/filename.mp4
// assFile: tmp/filename.ass
// output: tmp/filename_final.mp4
module.exports.applyAssSubtitles = async (inputVideo, inputAudio, assFile, output) => {
    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${inputVideo}" -i "${inputAudio}" -vf "ass=${assFile}" -map 0:v -map 1:a -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -profile:v high -level 4.1 -c:a aac -b:a 192k "${output}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve(stdout || stderr);
        });
    });
}



// filepath: tmp/filename.mp4 // filepath = req.file.path
module.exports.saveAssSubtitles = async (filePath, ass) => {
    const assOutput = files.getPathWithoutFileName(filePath) + "/" + files.getFileNameWithoutExtension(filePath) + ".ass";
    fs.writeFileSync(assOutput, ass);
    return assOutput;
}