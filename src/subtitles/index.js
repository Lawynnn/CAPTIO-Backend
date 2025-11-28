const fs = require("fs");
const path = require("path");

/**
 * @typedef TemplateConfig
 * @property {string} name
 * @property {string} font
 * @property {string} fontName
 * @property {number} fontSize
 * @property {number} outline
 * @property {number} shadow
 * @property {string} normalColor
 * @property {string} highlightColor
 * @property {number} bounceIn
 * @property {number} bounceOut
 * @property {number} bounceInScale
 * @property {number} maxWordsPerGroup
 * @property {number} maxGap
 * @property {boolean} uppercase
 */

/**
 * 
 * @param {string} templateName 
 * @param {Array} words 
 * @param {TemplateConfig} overrideConfig 
 * @returns 
 */
async function generate(templateName, words, overrideConfig = {}) {
    const templateDir = path.join(__dirname, templateName);

    if (!fs.existsSync(templateDir)) {
        throw new Error(`Template '${templateName}' not found in subtitles/`);
    }

    const configPath = path.join(templateDir, "config.json");
    const baseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const finalConfig = {
        ...baseConfig,
        ...overrideConfig
    };

    const templateFn = require(path.join(templateDir, "template.js"));

    return templateFn(words, finalConfig);
}

function getValidTemplates() {
    return fs.readdirSync(__dirname).filter(file => {
        const p = path.join(__dirname, file);
        return fs.lstatSync(p).isDirectory()
            && fs.existsSync(path.join(p, "template.js"))
            && fs.existsSync(path.join(p, "config.json"));
    });
}

module.exports = { generate, getValidTemplates };
