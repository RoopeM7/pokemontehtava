import express from "express"; // Pokemon Gotta catch em all pokemon!!
import path from "path";
import fetch from "node-fetch";

const app = express();
const port = 3000;
const host = "localhost";

app.use(express.static("includes"));

const pokeapi = "https://pokeapi.co/api/v2";
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("etusivu", {
    generations: Array.from({ length: 9 }, (_, i) => i + 1),
  });
});
// pokemon kohta
app.get("/sukupolvi/:numero", async (req, res) => {
  const numero = parseInt(req.params.numero, 10);
  if (isNaN(numero) || numero < 1 || numero > 9) {
    return res.status(400).send("Väärä generaatio.");
  }

  try {
    const response_json = await fetch(
      `https://pokeapi.co/api/v2/generation/${numero}/`
    );

    if (!response_json.ok) {
      throw new Error("Generaatiota ei löytynyt.");
    }

    const data = await response_json.json();

    const pokemonList = data.pokemon_species.map((pokemon) => ({
      name: pokemon.name,
      url: `/pokemon/${pokemon.name}`,
    }));

    res.render("sukupolvisivu", { numero, pokemonList });
  } catch (error) {
    console.error("Virhe haettaessa sukupolvea:", error.message);
    res.status(500).send("Virhe etsiessä/ladattaessa generaatio dataa.");
  }
});

app.get("/pokemon/:nimi", async (req, res) => {
  const { nimi } = req.params;
  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${nimi}/`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("API-vastaus epäonnistui.");

    const pokemon = await response.json();

    res.render("pokemon", { pokemon });
  } catch (error) {
    res.status(404).send("Pokemonia ei löydy. VALITETTAVASTI!");
  }
});

// Pokekomin hakutoiminto kohta ALKAA!!!
app.get("/pokemon", async (req, res) => {
  const { nimi } = req.query;

  if (!nimi) {
    return res
      .status(400)
      .render("virhesivu", { message: "Anna Pokemonin nimi!" });
  }

  const apiUrl = `https://pokeapi.co/api/v2/pokemon/${nimi.toLowerCase()}/`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Pokemonia ei löytynyt!");

    const pokemonData = await response.json();
    res.redirect(`/pokemon/${pokemonData.name}`);
  } catch (error) {
    res.status(404).render("virhesivu", {
      message: `Pokemon '${nimi}' ei löytynyt. VALITETTAVASTI!`,
    });
  }
}); //pokemonin hakutoimintokohta LOPPUU!!!

app.listen(port, host, () => {
  console.log(` http://localhost:${port} kuunteleee.......`);
});
