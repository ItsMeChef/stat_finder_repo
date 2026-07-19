import 'dotenv/config'
import express from 'express'

import healthController from './controllers/health.controller.js'

// app config
const app = express()
const PORT = process.env.SERVER_PORT || 3000

// route mounts
app.use('/api/v1/health', healthController)

// listener
app.listen(PORT, () => {
    console.log(`app listening on port:[${PORT}]`)
})