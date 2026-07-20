import axios from 'axios'
import pool from '../config/db.js'
import LinkedList from './LinkedList.js'

export default class Pokemon {
    #pokemonCount = 0 // I realized I could have better scope handling here, will fix later...
    #pokemonCountReal = 0 // I realized I could have better scope handling here, will fix later...
    #pokemonSpeciesLink = "https://pokeapi.co/api/v2/pokemon-species"
    #pokemonLink = "https://pokeapi.co/api/v2/pokemon"
    #pokemonTypeLink = "https://pokeapi.co/api/v2/type"
    #pokemonMoveLink = 'https://pokeapi.co/api/v2/move'

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

            return false;
        } finally {
            console.log("populatePokemon() finished...")
        }
    }

    async populateTypes() {
        try {
            const response = await axios.get(this.#pokemonTypeLink)
            let count = parseInt(response.data?.count) || 0

            const client = await pool.connect()

            try {
                await client.query('BEGIN')
                for (let i = 0; i < count - 1; i++) {
                    let id = i + 1
                    let name = response.data.results[i].name

                    let insertQuery = {
                        text: `
                            INSERT INTO POKEMON.TYPE(type_id, name)
                            VALUES ($1, $2)
                        `,
                        values: [id, name]
                    }

                    await client.query(insertQuery)
                    console.log(`POKEMON_TYPE: id:[${id}]name:[${name}]`)
                }

                await client.query('COMMIT')

                return true;

            } catch(e) {
                console.error('ERROR: (ROLLING BACK)', e)
                await client.query('ROLLBACK')
                return false
            } finally {
                console.log('RELEASING DB CONNECTION!')
                client.release()
            }
        } catch(e) {
            console.error('ERROR: ', e)
            return false
        } 
    }

    async populatePokemonTypes() {
        try {
            const client = await pool.connect()
            try {
                await client.query('BEGIN')

                const pokemonCountQuery = {
                    text: `
                        SELECT COUNT(*)
                          FROM POKEMON.POKEMON
                    `,
                    values: []
                }

                let pokemonCount = await client.query(pokemonCountQuery)
                pokemonCount = parseInt(pokemonCount.rows[0].count) || 0
                console.log(pokemonCount)

                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

                const pokeMap = new Map()
                for (let i = 0; i < pokemonCount; i++) { // pokemonCount
                    let id = i + 1
                    let response = await axios.get(this.#pokemonLink + `/${id}`)
                    let currentTypesList = response.data.types
                    pokeMap.set(id, currentTypesList)

                    console.log(id,' ' , pokeMap.get(id))
                    await delay(this.delay)
                }

                let pokemonTypeId = 1
                for (let i = 0; i < pokemonCount; i++) {
                    let id = i + 1
                    console.log('DEBUG', pokeMap.get(id))
                    for (let j = 0; j < pokeMap.get(id).length; j++) {
                        const selectTypeIdQuery = {
                            text: `
                                SELECT type_id
                                  FROM POKEMON.TYPE
                                 WHERE name = $1
                            `,
                            values: [pokeMap.get(id)[j].type.name.toLowerCase()]
                        }

                        const typeIdResults = await client.query(selectTypeIdQuery)
                        let typeId = typeIdResults.rows[0].type_id

                        console.log({
                            pokemonTypeId: pokemonTypeId,
                            id: id,
                            typeId: typeId
                        })
                        const insertPokemonTypesQuery = {
                            text: `
                                INSERT INTO POKEMON.POKEMON_TYPES (pokemon_type_id, pokemon_id, type_id)
                                VALUES ($1, $2, $3)
                            `, 
                            values: [pokemonTypeId, id, typeId]
                        }

                        await client.query(insertPokemonTypesQuery)
                        console.log(`INSERTED pokemon_type_id:[${pokemonTypeId}]\npokemon_id:[${id}]\ntype_id:${typeId}`)

                        pokemonTypeId++
                    }
                }
                
                console.log('INSERTION COMPLETE!\nNOW COMITTING!!!')
                await client.query('COMMIT')

                return true
            } catch(e) {
                await client.query('ROLLBACK')
                console.log(`ERROR: ${e}\nROLLING BACK!!!`)
                return false
            } finally {
                console.log('RELEASING CLIENT!!!')
                client.release()
            }
        } catch(e) {
            console.log("Error: ", e)
            return false;
        } finally {
            console.log('populatePokemonTypes() Finished!')
        }
    }

    async populateStatType() {
        try {
            const client = await pool.connect()

            // NOTE: LAST THREE ELEMENTS WILL NEED TO BE HANDLED IN DATABASE DESIGN.
            // A THEY ARE NOT ATTACHED TO A POKEMON ENTITY BUT A POKEMON INSTANCE.
            // WILL DO IN THE FUTURE
            const statTypes = [
                {
                    name: 'hp',
                    isDefault: true
                },
                {
                    name: 'attack',
                    isDefault: true
                },
                {
                    name: 'defense',
                    isDefault: true
                },
                {
                    name: 'special-attack',
                    isDefault: true
                },
                {
                    name: 'special-defense',
                    isDefault: true
                },
                {
                    name: 'speed',
                    isDefault: true
                },
                {
                    name: 'accuracy',
                    isDefault: false                  
                },
                {
                    name: 'evasion',
                    isDefault: false
                },
                {
                    name: 'special',
                    isDefault: false
                }
            ]

            try {
                await client.query('BEGIN')
                let id = 1
                for (let i = 0; i < statTypes.length; i++) {
                    if (statTypes[i].isDefault) {
                        const insertQuery = {
                            text: `
                                INSERT INTO pokemon.stat_type
                                VALUES ($1, $2)
                            `,
                            values: [id, statTypes[i].name]
                        }             
                        
                        await pool.query(insertQuery)

                        id++
                    }
                }                
            } catch(e) {
                await client.query('ROLLBACK')
                console.log(`ERROR: ${e}\nROLLING BACK!!!`)
                return false
            } finally {
                console.log('RELEASING CLIENT!!!')
                client.release()
            }

            return true
        } catch(e) {
            console.log('Error: ', e)
            return false
        } finally {
            console.log('populateStatType() Finished!\nCLOSING CONNECTION!')

        }
    }
    
    async populateMoves() {
        let badIdStart = 10001
        let moveIdList = []
        const moveExceptionMap = new Map([
            ["struggle", 165],
            ["happy-hour", 603],
            ["z-moves", [[622, 639]
                       , [640, 658]
                       , [695, 728]
                       , [743, 826]]], // [min, max] ranges
            ["fixBadApiId", 919]
        ])

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        try {
            const client = await pool.connect()

            try {
                await client.query('BEGIN')

                try {
                    let moveResponseObj = await axios.get(this.#pokemonMoveLink)
                    let count = parseInt(moveResponseObj.data.count || 0)
                    if (count === 0) {
                        throw new Error("COUNT IS ZERO. UNEXPECTED ERROR!")
                    }
                    console.log('move count retrieval success...')
                    let moveSpecificResponseObjStr = `${this.#pokemonMoveLink}`
                    for (let i = 1; i < count; i++) {
                        console.log(`i:${i}\nbadIdStart:${badIdStart}`)
                        let moveSpecificResponseObj = i <= moveExceptionMap.get("fixBadApiId") 
                                                        ? await axios.get(moveSpecificResponseObjStr + `/${i}`)
                                                        : await axios.get(moveSpecificResponseObjStr + `/${badIdStart}`)
                        if (!(i <= moveExceptionMap.get("fixBadApiId"))) {
                            badIdStart++
                        }
                        let data = moveSpecificResponseObj.data
                        let learnedByPokemon = data.learned_by_pokemon.length === 0 ? false : data.learned_by_pokemon // LIST

                        if (!learnedByPokemon) {
                            let errCount = 0
                            let zMovesList = moveExceptionMap.get('z-moves') // [[], []]
                            for (let j = 0; j < zMovesList.length; j++) {
                                if (!(i >= zMovesList[j][0] && i <= zMovesList[j][1])) {
                                    errCount++
                                }
                            }
                            if (!moveExceptionMap.has(data.name)) {
                                errCount++
                            }

                            if (errCount === 2) {
                                throw new Error("learned_by_pokemon list from response is empty! OR not in exception range!")                                
                            }
                        }

                        moveIdList.push({
                            move_id: i,
                            name: data.name,
                            power: data.power,
                            pp: data.pp,
                            priority: data.priority,
                            learned_by_pokemon: learnedByPokemon || []
                        })

                        let moveIdPrintValue = i <= moveExceptionMap.get("fixBadApiId") ? moveIdList[i - 1].move_id : badIdStart
                        console.log(`move_id[${moveIdPrintValue}] inserted into LIST from AXIOS`)

                        await delay(this.delay)
                    }
                } catch(e) {
                    console.error('axios error: ', e)
                    return false
                } 


                let count = parseInt(moveIdList.length || 0)
                if (count === 0) {
                    throw new Error("COUNT IS ZERO. UNEXPECTED ERROR!")
                }
                for (let i = 1; i < count + 1; i++) {
                    const insertMovesQuery = {
                        text: `
                            INSERT INTO POKEMON.MOVE (move_id, name, power, pp, priority) 
                            VALUES ($1, $2, $3, $4, $5)
                        `,
                        values: [i
                               , moveIdList[i - 1].name
                               , moveIdList[i - 1].power
                               , moveIdList[i - 1].pp
                               , moveIdList[i - 1].priority
                                ]
                    }
                    await client.query(insertMovesQuery)

                    console.log(`move_id[${moveIdList[i - 1].move_id}] inserted into into DB!`)
                }

                console.log('INSERTION SUCCESS!\nCOMMITTING...')
                await client.query('COMMIT')

                return true
            } catch(e) {
                console.error(e)
                await client.query('ROLLBACK')
                return false
            } finally {
                console.log('CONNECTION RELEASED!')
                client.release()
            }
        } catch(e) {
            console.error('Connection to client error...', e)
            return false
        } finally {
            console.log('populateMoves() Finished!\nCLOSING CONNECTION!')
        }
    }
}

