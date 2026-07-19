import axios from 'axios'
import pool from '../config/db.js'

export default class Pokemon {
    #pokemonCount = 0
    #pokemonCountReal = 0
    #pokemonSpeciesLink = "https://pokeapi.co/api/v2/pokemon-species"
    #pokemonLink = "https://pokeapi.co/api/v2/pokemon"

    constructor(delay) {
        this.delay = delay
    }

    async populatePokemon() {
        try {
            const pokemonSpecies = await axios.get(this.#pokemonSpeciesLink)
            this.#pokemonCount = parseInt(pokemonSpecies.data.count);

            const pokemon = await axios.get(this.#pokemonLink)
            this.#pokemonCountReal = parseInt(pokemon.data.count);

            let loopCounter = this.#pokemonCount + 1
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

            console.log("db", process.env.DATABASE_URL )
            const client = await pool.connect()

            try {
                await client.query('BEGIN')

                for(let i = 1; i < loopCounter; i++) {
                    let pokeSpecies = await axios.get(`${this.#pokemonSpeciesLink}/${i}`)
                    pokeSpecies = pokeSpecies.data

                    let poke = await axios.get(`${this.#pokemonLink}/${i}`)
                    poke = poke.data

                    let insertQuery = {
                        text: `
                            INSERT INTO POKEMON.POKEMON (pokemon_id
                                                       , name
                                                       , base_experience
                                                       , weight
                                                       , height
                                                       , pokemon_order
                                                       , base_happiness
                                                       , capture_rate
                                                       , has_gender_differences
                                                       , hatch_counter
                                                       , is_baby
                                                       , is_legendary)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                        `,
                        values: [poke.id
                               , poke.name
                               , poke.base_experience
                               , poke.weight
                               , poke.height
                               , poke.order
                               , pokeSpecies.base_happiness
                               , pokeSpecies.capture_rate
                               , pokeSpecies.has_gender_differences
                               , pokeSpecies.hatch_counter
                               , pokeSpecies.is_baby
                               , pokeSpecies.is_legendary
                        ]
                    }

                    const result = await client.query(insertQuery)
                    console.log(`POKEMON WITH ID:[${poke.id}] INSERTED`)

                    await delay(this.delay)
                }

                await client.query('COMMIT')

                return true
        } catch(e) {
            console.error('Error: ', e)
            await client.query('ROLLBACK')
            return false
        } finally {
            client.release()
        }


        } catch (e) {
            console.error("axios error, populatePokemon() method inside of class 'Pokemon'\nERROR: ", e)

            return 0;
        } finally {
            console.log("populatePokemon() finished...")
        }
    }
}

