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