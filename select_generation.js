const generationLimits = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
};

const urlParams = new URLSearchParams(window.location.search);
const generation = urlParams.get("generation");

const [minId, maxId] = generationLimits[generation] || [1, 905];

document.getElementById("generation-title").innerText = `Génération ${generation}`;

async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const speciesData = await speciesResponse.json();

    const frenchNameObj = speciesData.names.find(name => name.language.name === "fr");
    const frenchName = frenchNameObj ? frenchNameObj.name : data.name;

    return {
        id: id,
        name: frenchName,
        img: data.sprites.other["official-artwork"].front_default
    };
}


async function loadPokemons() {
    const container = document.getElementById("pokemon-list");

    for (let i = minId; i <= maxId; i++) {
        const pokemon = await fetchPokemon(i);
        const card = document.createElement("div");
        card.className = "pokemon-card";
        card.innerHTML = `
            <img src="${pokemon.img}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
        `;
        card.onclick = () => {
            window.location.href = `game.html?generation=${generation}&id=${pokemon.id}`;
        };
        container.appendChild(card);
    }
}

function chooseRandom() {
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    window.location.href = `game.html?generation=${generation}&id=${randomId}`;
}

loadPokemons();
