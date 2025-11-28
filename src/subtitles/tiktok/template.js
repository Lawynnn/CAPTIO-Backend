function toAssTime(sec) {
    const cs = Math.round(sec * 100);
    const hh = Math.floor(cs / 360000);
    const mm = Math.floor((cs % 360000) / 6000);
    const ss = Math.floor((cs % 6000) / 100);
    const cc = cs % 100;
    return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(cc).padStart(2, "0")}`;
}

function escape(text) {
    return text.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
}

function groupWords(words, maxWords, maxGap) {
    const groups = [];
    let g = [];

    for (let i = 0; i < words.length; i++) {
        const w = words[i];

        if (!g.length) {
            g.push(w);
            continue;
        }

        const gap = w.start - g[g.length - 1].end;
        if (g.length >= maxWords || gap > maxGap) {
            groups.push(g);
            g = [w];
        } else {
            g.push(w);
        }
    }

    if (g.length) groups.push(g);
    return groups;
}

module.exports = function generateTikTokASS(words, config) {
    const groups = groupWords(words, config.maxWordsPerGroup, config.maxGap);

    let ass = `
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Style: Card,${config.fontName},${config.fontSize},&HFFFFFF,&H00000000,&H64000000,&H00000000,${config.outline},0,${config.shadow},2,150,150,0,2,1,20,20,2

[Fonts]
fontname: ${config.fontName}
filename: ${config.font}

[Events]
`;

    groups.forEach(group => {
        const gStart = group[0].start;
        const gEnd = group[group.length - 1].end + 0.15;

        let line = `{\\an5\\pos(540,1650)}`;

        group.forEach(w => {
            const word = config.uppercase ? w.word.toUpperCase() : w.word;
            const safe = escape(word);

            const localStart = Math.round((w.start - gStart) * 1000);
            const inEnd = localStart + config.bounceIn;
            const outEnd = inEnd + config.bounceOut;

            line += `{\\t(${localStart},${inEnd},\\fscx130\\fscy130\\c${config.highlightColor})` +
                `\\t(${inEnd},${outEnd},\\fscx100\\fscy100\\c${config.normalColor})}` +
                safe + " ";
        });

        ass += `Dialogue: 0,${toAssTime(gStart)},${toAssTime(gEnd)},Card,,0,0,0,,${line}\n`;
    });

    return ass;
};
