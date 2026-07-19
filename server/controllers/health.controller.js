import express from 'express'
import HealthService from '../services/health.service.js'

const router = express.Router()

router.get('/postgres-health', async (req, res) => {
    try {
        const healthService = new HealthService()
        const dbConnectionTest = await healthService.testConnection()

        if (!dbConnectionTest) {
            console.log('--DB Connection Successful!--\n--NOTE: UNEXPECTEDLY RETURNED NO ROWS!!!--')
            res.status(200).json({
                success: true,
                status: 200,
                message: "NOTE: UNEXPECTEDLY RETURNED NO ROWS!!!"         
            })
            return
        }

        const queryResultString = `'dbConnectionTest' query results: ${dbConnectionTest}`
        console.log(queryResultString)
        res.status(200).json({
            success: true,
            status: 200,
            message: queryResultString
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