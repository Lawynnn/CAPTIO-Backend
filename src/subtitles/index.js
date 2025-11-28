const fs = require("fs");
const path = require("path");

async function generate(templateName, words) {
    const templateDir = path.join(__dirname, templateName);

    if (!fs.existsSync(templateDir)) {
        throw new Error(`Template '${templateName}' not found in subtitles/`);
    }

    const configPath = path.join(templateDir, "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const templateFn = require(path.join(templateDir, "template.js"));

    const assContent = templateFn(words, config);
    return assContent;
}

function getValidTemplates() {
    const templates = fs.readdirSync(__dirname).filter(file => {
        const templatePath = path.join(__dirname, file);
        return fs.lstatSync(templatePath).isDirectory() && fs.existsSync(path.join(templatePath, "template.js")) && fs.existsSync(path.join(templatePath, "config.json"));
    });
    return templates;
}

module.exports = { generate, getValidTemplates };