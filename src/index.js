const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/tmp", express.static("tmp"));

app.get("/", (req, res) => {
    res.json({ message: "CAPTIO Backend is running." });
})

app.use("/upload", require("./routes/videoUpload"));
app.use("/view", require("./routes/videoView"));

app.use("/generate", require("./routes/generateSubtitles"));
app.use("/merge", require("./routes/mergeSubtitles"));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})