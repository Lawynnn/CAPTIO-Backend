function toAssTime(sec) {
    const cs = Math.round(sec * 100);
    const hh = Math.floor(cs / 360000);
    const mm = Math.floor((cs % 360000) / 6000);
    const ss = Math.floor((cs % 6000) / 100);
    const cc = cs % 100;
    return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cc).padStart(2, "0")}`;
}

function escapeText(text) {
    return text.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
}

function groupWords(words, maxWords, maxGap) {
    const groups = [];
    let g = [];

    for (let w of words) {
        if (!g.length) {
            g.push(w);
            continue;
        }

        const last = g[g.length - 1];
        if (g.length >= maxWords || w.start - last.end > maxGap) {
            groups.push(g);
            g = [w];
        } else {
            g.push(w);
        }
    }

    if (g.length) groups.push(g);
    return groups;
}

// 🔥 Mapare align -> position Y
function getAlignPosition(align) {
    switch (align) {
        case "top":
            return 300;
        case "center":
            return 960;
        case "bottom":
        default:
            return 1500;
    }
}

module.exports = function generateTikTokASS(words, config) {
    const groups = groupWords(words, config.maxWordsPerGroup, config.maxGap);

    const yPos = getAlignPosition(config.align);

    let ass = `
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Style: Card,${config.fontName},${config.fontSize},${config.normalColor},&H00000000,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,${config.outline},${config.shadow},5,0,0,80,1

[Fonts]
fontname: ${config.fontName}
filename: ${config.font}

[Events]
`;

    groups.forEach(group => {
        const gStart = group[0].start;
        const gEnd = group[group.length - 1].end + 0.10;

        // 🔥 ALINIERE DIN CONFIG
        let line = `{\\an5\\pos(540,${yPos})\\fad(150,150)\\b1}`;

        group.forEach(w => {
            const safeWord = escapeText(config.uppercase ? w.word.toUpperCase() : w.word);

            const localStart = Math.round((w.start - gStart) * 1000);
            const inEnd = localStart + config.bounceIn;
            const outEnd = inEnd + config.bounceOut;

            const scale = config.bounceInScale ?? 115;

            line += `{\\t(${localStart},${inEnd},\\fscx${scale}\\fscy${scale}\\c${config.highlightColor})` +
                `\\t(${inEnd},${outEnd},\\fscx100\\fscy100\\c${config.normalColor})}` +
                safeWord + " ";
        });

        ass += `Dialogue: 0,${toAssTime(gStart)},${toAssTime(gEnd)},Card,,0,0,0,,${line}\n`;
    });

    return ass;
};
