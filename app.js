const express = require("express")
const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
const fs = require("fs")

const outputFilePath = "./input.mp4"
const outputAudioPath = "./audioinput.webm"

async function downloadVideo(videoURL, options, outputFilePath, startTime, endTime) {
    filestatus = 0
    await new Promise((resolve) => {
        ytdl(videoURL, options)
            .pipe(fs.createWriteStream(outputFilePath))
            .on("close", () => {
                resolve()
            })
    })

    await new Promise((resolve) => {
        ytdl(videoURL, {filter: "audioonly", quality: "251"})
            .pipe(fs.createWriteStream(outputAudioPath))
            .on("close", () => {
                resolve()
            })
    })

    console.log("Download Finished")

    timeOffset = (endTime - startTime)

    await new Promise((resolve, reject) => {
        ffmpeg.setFfmpegPath(ffmpegPath)
        ffmpeg()
            .addInput("./input.mp4")
            .addInput("./audioinput.webm")
            .outputOptions("-c:v copy")
            .setStartTime(startTime)
            .setDuration(timeOffset)
            .addOption(["-preset", "ultrafast"])
            .output("output.mp4")
            .run()
            .on("error", (err) => {
                console.error(err.message)
                reject("error")
            })
            .on("end", () => {
                resolve()
            })
    })

    filestatus = 1
    console.log("File Ready")
}

const app = express()
const port = 3000

app.use(express.static(__dirname))
app.use(express.urlencoded({extended: false}))
app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.use((req, res, next) => {
    req.setTimeout(300000);
    res.setTimeout(300000);
    next();
});

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", (req, res) => {
    url = req.body.video_url
    res.render("slicer", { videoUrl: url })
})

var filestatus = 0

app.post("/download", async (req, res) => {
    url = req.body.video_url
    const {start_hours, start_minutes, start_seconds, start_milliseconds} = req.body
    const {end_hours, end_minutes, end_seconds, end_milliseconds} = req.body

    let a = new Date(1970, 0, 1, start_hours, start_minutes, start_seconds, start_milliseconds)
    let b = new Date(1970, 0, 1, end_hours, end_minutes, end_seconds, end_milliseconds)

    /* options = { */
    /*     quality: "lowest", */
    /*     filter: "audioandvideo" */
    /* } */

    options = {
        quality: "133"
    }

    try {
        downloadVideo(url, options, outputFilePath, a / 1000, b / 1000)
    } catch (err) {
        console.error(err)
        res.send("Deu ruim")
        return
    }

    res.redirect("/oymate")
})

app.get("/success", (req, res) => {
    res.download(__dirname + "/output.mp4")
    filestatus = 0
})

app.get("/oymate", (req, res) => {
    if (filestatus) {
        res.redirect("/success")
    } else {
        res.render("queue")
    }
})

app.listen(port, () => {
    console.log("App is running on port " + port)
})
