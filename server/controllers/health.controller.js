import express from 'express'
import HealthModel from '../models/health.model.js'

const router = express.Router()

router.get('/postgres-health', async (req, res) => {
    const healthModel = new HealthModel()

    try {
        const testResult = await healthModel.testConnection()

        console.log(testResult)
        res.status(200).json({
            success: true,
            status: 200,
            message: testResult.test_string
        })
    } catch (e) {
        console.error("testConnection error: ", e)
        res.status(500).json({
            success: false,
            status: 500,
        })
    }
})

export default router