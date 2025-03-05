const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express()


app.use(express.json())
app.use(cors())


app.get("/", (req, res) => {
    res.send({running: true})
})

app.listen(port, () => {
    console.log(`Surver running on port ${port}`)
})