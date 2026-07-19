import pool from "../config/db.js"

class HealthModel {
    async findConnectionTest() {
        const selectTestQuery = `
            SELECT *
              FROM public.test
        `
        
        try {
            const result = await pool.query(selectTestQuery)

            return result.rows[0]?.test_string || null            
        } catch(e) {
            console.log('QUERY ERROR :(', e)
            return null
        }

    }
}

export default HealthModel