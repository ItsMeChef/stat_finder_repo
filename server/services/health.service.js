import HealthModel from "../models/health.model.js";

class HealthService {
    async testConnection() {
        const healthModel = new HealthModel()
        const testResult = await healthModel.findConnectionTest()

        return testResult || null
    }
}

export default HealthService