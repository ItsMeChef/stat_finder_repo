import pool from "../config/db.js"

class HealthModel {
    async testConnection() {
        const result = await pool.query('SELECT * FROM public.test')

        return result.rows[0]
    }
}

export default HealthModel