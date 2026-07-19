import 'dotenv/config'
import Pokemon from "../classes/Pokemon.js";

async function populatePokemon() {
    const pokemon = new Pokemon(parseInt(process.env.API_DELAY) || 2000)

    let isSuccessful = await pokemon.populatePokemon()
    if (!isSuccessful) {
        console.log('INSERT TRANSACTION IS NO GOOD!\nROLLING BACK!')
        return
    }

    console.log('INSERTION SUCCESSFUL! NOW COMMITING...')
}

populatePokemon()