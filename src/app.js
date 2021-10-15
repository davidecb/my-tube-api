const express = require('express')
require('./db/mongoose')
const helmet = require('helmet')
const cors = require('cors')
const userRouter = require('./routers/user')
const videoRouter = require('./routers/video')

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(userRouter)
app.use(videoRouter)

module.exports = app