const express = require('express')
const app = express()
const port = 3000

app.get("/", (req, res) => {
    res.sendFile("/home/rafael/hello_world/home.html")
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`)
})
