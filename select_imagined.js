async function loadImaginedPokemons() {
    const response = await fetch("data/pokemonImagine.json");
    const pokemons = await response.json();
    const container = document.getElementById("imagined-list");

    pokemons.forEach((pokemon, index) => {
        const card = document.createElement("div");
        card.className = "imagined-card";
        card.innerHTML = `
                    <img src="${pokemon.img}" alt="${pokemon.name}">
                    <h3>${pokemon.name}</h3>
                `;
        card.onclick = () => {
            window.location.href = `game.html?generation=imagine&pokemonIndex=${index}`;
        };
        container.appendChild(card);
    });
}

function chooseRandom() {
    window.location.href = `game.html?generation=imagine`;
}

loadImaginedPokemons();