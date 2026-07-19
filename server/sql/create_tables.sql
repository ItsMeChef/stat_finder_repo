---------------------------------------------------------------------------------------------------------------------------------------------------------------
-- DATABASE: stat_finder_db
---------------------------------------------------------------------------------------------------------------------------------------------------------------
-- SCHEMA: public --
CREATE TABLE public.test (
	test_id INTEGER PRIMARY KEY,
	test_string VARCHAR(25) NOT NULL
);
---------------------------------------------------------------------------------------------------------------------------------------------------------------
 -- SCHEMA: pokemon
CREATE TABLE pokemon.pokemon (
	pokemon_id INTEGER PRIMARY KEY,
	name VARCHAR(20) NOT NULL UNIQUE,
	base_experience INTEGER NOT NULL,
	weight NUMERIC NOT NULL,
	height NUMERIC NOT NULL,
	pokemon_order INTEGER NOT NULL
);
SELECT * FROM pokemon.pokemon;

ALTER TABLE pokemon.pokemon
ADD COLUMN base_happiness INTEGER NOT NULL,
ADD COLUMN capture_rate INTEGER NOT NULL,
ADD COLUMN has_gender_differences BOOLEAN NOT NULL,
ADD COLUMN hatch_counter INTEGER NOT NULL,
ADD COLUMN is_baby BOOLEAN NOT NULL,
ADD COLUMN is_legendary BOOLEAN NOT NULL;

CREATE TABLE pokemon.move (
	move_id INTEGER PRIMARY KEY,
	name VARCHAR(20) NOT NULL UNIQUE
);
SELECT * FROM pokemon.move;

CREATE TABLE pokemon.pokemon_moves (
	pokemon_move_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	move_id INTEGER NOT NULL,
	CONSTRAINT fk_pokemon_moves_pokemon_id
    FOREIGN KEY (pokemon_id)
    REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_moves_move_id
	FOREIGN KEY (move_id)
	REFERENCES pokemon.move(move_id)
);
SELECT * FROM pokemon.pokemon_moves;

CREATE TABLE pokemon.language (
	language_id INTEGER PRIMARY KEY,
	language VARCHAR(25) NOT NULL
);
SELECT * FROM pokemon.language;

CREATE TABLE pokemon.pokemon_languages (
	pokemon_language_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	language_id INTEGER NOT NULL,
	name VARCHAR(20) NOT NULL,
	CONSTRAINT fk_pokemon_languages_pokemon_id
	FOREIGN KEY (pokemon_id)
	REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_languages_language_id
	FOREIGN KEY (language_id)
	REFERENCES pokemon.language(language_id)
);
SELECT * FROM pokemon.pokemon_languages;

CREATE TABLE pokemon.generation (
	generation_id INTEGER PRIMARY KEY,
	generation VARCHAR(10) NOT NULL
);
SELECT * FROM pokemon.generation;

CREATE TABLE pokemon.pokemon_generations (
	pokemon_generation_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	generation_id INTEGER NOT NULL,
	CONSTRAINT fk_pokemon_generations_pokemon_id
	FOREIGN KEY (pokemon_id)
	REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_generations_generation_id
	FOREIGN KEY (generation_id)
	REFERENCES pokemon.generation(generation_id)
);
SELECT * FROM pokemon.pokemon_generations;

CREATE TABLE pokemon.game (
	game_id INTEGER PRIMARY KEY,
	name VARCHAR(20) NOT NULL,
	generation_id INTEGER NOT NULL,
	CONSTRAINT fk_game_generation_id
	FOREIGN KEY (generation_id)
	REFERENCES pokemon.generation(generation_id)
);
SELECT * FROM pokemon.game;

CREATE TABLE pokemon.ability (
	ability_id INTEGER PRIMARY KEY,
	name VARCHAR(20) NOT NULL
);
SELECT * FROM pokemon.ability;

CREATE TABLE pokemon.pokemon_abilities (
	pokemon_ability_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	ability_id INTEGER NOT NULL,
	CONSTRAINT fk_pokemon_abilities_pokemon_id
	FOREIGN KEY (pokemon_id)
	REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_abilities_ability_id
	FOREIGN KEY (ability_id)
	REFERENCES pokemon.ability(ability_id)
);
SELECT * FROM pokemon.pokemon_abilities;

CREATE TABLE pokemon.type (
	type_id INTEGER PRIMARY KEY,
	name VARCHAR(20) NOT NULL
);

CREATE TABLE pokemon.pokemon_types (
	pokemon_type_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	type_id INTEGER NOT NULL, 
	CONSTRAINT fk_pokemon_types_pokemon_id
	FOREIGN KEY (pokemon_id)
	REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_types_type_id
	FOREIGN KEY (type_id)
	REFERENCES pokemon.type(type_id)
);
SELECT * FROM pokemon.pokemon_types;

CREATE TABLE pokemon.stat_type (
	stat_type_id INTEGER PRIMARY KEY,
	name VARCHAR(15) NOT NULL
);
SELECT * FROM pokemon.stat_type;

CREATE TABLE pokemon.pokemon_base_stats (
	pokemon_base_stat_id SERIAL PRIMARY KEY,
	pokemon_id INTEGER NOT NULL,
	stat_type_id INTEGER NOT NULL,
	base_stat INTEGER NOT NULL,
	ev_yield INTEGER NOT NULL,
	CONSTRAINT fk_pokemon_base_stats_pokemon_id
	FOREIGN KEY (pokemon_id)
	REFERENCES pokemon.pokemon(pokemon_id),
	CONSTRAINT fk_pokemon_base_stats_stat_type_id
	FOREIGN KEY (stat_type_id)
	REFERENCES pokemon.stat_type(stat_type_id)
);
SELECT * FROM pokemon.pokemon_base_stats;

CREATE TABLE pokemon.nature (
	nature_id INTEGER PRIMARY KEY,
	nature VARCHAR(15) NOT NULL
);
SELECT * FROM pokemon.nature;

CREATE TABLE pokemon.effect (
	effect_id INTEGER PRIMARY KEY,
	effect VARCHAR(15) NOT NULL
);
SELECT * FROM pokemon.effect;

CREATE TABLE pokemon.stat_nature_effect (
	stat_nature_effect SERIAL PRIMARY KEY,
	stat_type_id INTEGER NOT NULL,
	nature_id INTEGER NOT NULL,
	effect_id INTEGER NOT NULL,
	CONSTRAINT fk_stat_nature_effect_stat_type_id
	FOREIGN KEY (stat_type_id)
	REFERENCES pokemon.stat_type(stat_type_id),
	CONSTRAINT fk_stat_nature_effect_nature_id
	FOREIGN KEY (nature_id)
	REFERENCES pokemon.nature(nature_id),
	CONSTRAINT fk_stat_nature_effect_effect_id
	FOREIGN KEY (effect_id)
	REFERENCES pokemon.effect(effect_id)
);
SELECT * FROM pokemon.stat_nature_effect;











