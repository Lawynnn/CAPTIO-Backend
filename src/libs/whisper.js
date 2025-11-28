const openai = require("openai");
const fs = require("fs");
require('dotenv').config();

const ai = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

module.exports.transcribeAudio = async (audioPath) => {
    try {
        const file = fs.createReadStream(audioPath);
        const transcription = await ai.audio.transcriptions.create({
            model: "whisper-1",
            file,
            response_format: "verbose_json",
            timestamp_granularities: ["word"]
        })
        return transcription.words;
    }
    catch (error) {
        throw new Error(`Transcription failed: ${error.message}`);
    }
}