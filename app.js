const express = require("express")
const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
const fs = require("fs")

const outputFilePath = "./input.mp4"

async function downloadVideo(videoURL, options, outputFilePath, startTime, endTime) {
    await new Promise((resolve) => {
        ytdl(videoURL, options)
            .pipe(fs.createWriteStream(outputFilePath))
            .on("close", () => {
                resolve()
            })
    })

    timeOffset = (endTime - startTime)

    await new Promise((resolve) => {
        ffmpeg.setFfmpegPath(ffmpegPath)
        ffmpeg("./input.mp4")
            .setStartTime(startTime)
            .setDuration(timeOffset)
            .output("output.mp4")
            .run()
            .on("end", () => {
                resolve()
            })
    })
}

const app = express()
const port = 3000

app.use(express.static(__dirname))
app.use(express.urlencoded({extended: false}))
app.set("view engine", "ejs")
app.set("views", __dirname + "/views")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", (req, res) => {
    url = req.body.video_url
    res.render("slicer", { videoUrl: url })
})

app.post("/download", async (req, res) => {
    url = req.body.video_url
    console.log(req.body)
    const {start_hours, start_minutes, start_seconds, start_milliseconds} = req.body
    const {end_hours, end_minutes, end_seconds, end_milliseconds} = req.body

    let a = new Date(1970, 0, 1, start_hours, start_minutes, start_seconds, start_milliseconds) - 3*3600*1000
    let b = new Date(1970, 0, 1, start_hours, end_minutes, end_seconds, end_milliseconds) - 3*3600*1000

    options = {
        quality: "lowest",
        filter: "audioandvideo"
    }

    await downloadVideo(url, options, outputFilePath, a / 1000, b / 1000)
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    res.setHeader('Content-Type', 'video/mp4');
    res.download(__dirname + "/output.mp4")
})

app.listen(port, () => {
    console.log("App is running on port " + port)
})
