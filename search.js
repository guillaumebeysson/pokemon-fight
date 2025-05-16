const input = document.getElementById("pokemon-search");
const resultsContainer = document.getElementById("search-results");
let allPokemon = [];

async function fetchAllPokemonNames() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    const data = await response.json();

    const pokemonData = await Promise.all(data.results.map(async (pokemon, index) => {
        try {
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${index + 1}`);
            const speciesData = await speciesRes.json();
            const frName = speciesData.names.find(n => n.language.name === "fr")?.name || pokemon.name;

            return {
                id: index + 1,
                name: frName.toLowerCase(),
                displayName: frName,
                img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
            };
        } catch {
            return null;
        }
    }));

    allPokemon = pokemonData.filter(p => p !== null);
}

input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    resultsContainer.innerHTML = "";

    if (query.length < 3) return;

    const matches = allPokemon.filter(p => p.name.startsWith(query)).slice(0, 10);
    matches.forEach(pokemon => {
        const div = document.createElement("div");
        div.classList.add("result-item");

        div.innerHTML = `
            <img src="${pokemon.img}" alt="${pokemon.displayName}">
            <span>${pokemon.displayName}</span>
        `;

        div.onclick = () => {
            window.location.href = `game.html?generation=all&id=${pokemon.id}`;
        };

        resultsContainer.appendChild(div);
    });
});

fetchAllPokemonNames();
