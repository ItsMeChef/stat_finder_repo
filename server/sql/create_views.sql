CREATE VIEW pokemon.pokemon_types_v AS
SELECT p.pokemon_id
     , p.name AS pokemon_name
     , t.name AS type_name
  FROM pokemon.pokemon p
  JOIN pokemon.pokemon_types pt
    ON p.pokemon_id = pt.pokemon_id
  JOIN pokemon.type t
    ON t.type_id = pt.type_id;

SELECT * FROM pokemon.pokemon_types_v;