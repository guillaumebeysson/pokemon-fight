// script.js

let pokemonData = { player: null, opponent: null };

// Fonction pour obtenir un ID aléatoire
function getRandomPokemonId() {
    return Math.floor(Math.random() * 1010) + 1; // Génère un ID entre 1 et 1010
}

// Fonction pour récupérer les données d'un Pokémon via l'API PokéAPI
async function getPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données Pokémon !");
        }
        const data = await response.json();

        // Récupère les 4 premières attaques disponibles
        const attacks = data.moves.slice(0, 4).map(move => move.move.name);

        return {
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1), // Nom avec majuscule
            img: data.sprites.front_default, // Image du Pokémon
            attacks: attacks, // Attaques
            health: 100, // Santé initiale
        };
    } catch (error) {
        console.error("Impossible de récupérer les données d'un Pokémon :", error);
        alert("Erreur lors de la récupération des données Pokémon.");
        return null;
    }
}

// Fonction pour charger les Pokémon du joueur et de l'adversaire
async function loadGameData() {
    const playerPokemonId = getRandomPokemonId();
    const opponentPokemonId = getRandomPokemonId();

    const playerPokemon = await getPokemonData(playerPokemonId);
    const opponentPokemon = await getPokemonData(opponentPokemonId);

    pokemonData.player = playerPokemon;
    pokemonData.opponent = opponentPokemon;

    initializeGame();
}

// Initialise le jeu avec les données des Pokémon
function initializeGame() {
    // Mise à jour des images et noms
    document.getElementById("player-img").src = pokemonData.player.img;
    document.getElementById("opponent-img").src = pokemonData.opponent.img;
    document.querySelector("#player h2").innerText = pokemonData.player.name;
    document.querySelector("#opponent h2").innerText = pokemonData.opponent.name;

    // Ajout des attaques du joueur
    const playerAttacks = document.getElementById("player-attacks");
    playerAttacks.innerHTML = ""; // Vide les anciens boutons
    pokemonData.player.attacks.forEach((attack) => {
        const button = document.createElement("button");
        button.innerText = attack;
        button.onclick = () => playerAttack(attack);
        playerAttacks.appendChild(button);
    });
}

// Fonction pour mettre à jour la barre de vie
function updateHealth(pokemon, newHealth) {
    const healthBar = document.getElementById(`${pokemon}-health`);
    const currentHealth = parseInt(healthBar.style.width);
    const healthDifference = currentHealth - newHealth;

    let elapsedTime = 0;
    const animationDuration = 1000; // Durée totale de l'animation (1s)
    const interval = 10;

    // Anime la diminution de la barre de vie
    const intervalId = setInterval(() => {
        elapsedTime += interval;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        const interpolatedHealth = currentHealth - progress * healthDifference;
        healthBar.style.width = `${Math.max(0, interpolatedHealth)}%`;
        healthBar.innerText = `${Math.round(interpolatedHealth)} PV`;

        if (progress >= 1) {
            clearInterval(intervalId);

            // Si la santé atteint 0, afficher le message de fin
            if (newHealth <= 0) {
                healthBar.innerText = "KO!";
                const winner = pokemon === "player" ? "opponent" : "player";
                const winnerData = pokemon === "player" ? pokemonData.opponent : pokemonData.player;

                document.querySelector(".container").innerHTML = `
                    <h1>${winner === "player" ? "Ton Pokémon" : "L'Adversaire"} a gagné !</h1>
                    <img src="${winnerData.img}" alt="Gagnant" style="width: 200px; height: auto;">
                    <div class="reload">
                        <button onclick="window.location.reload()">Rejouer</button>
                    </div>
                `;
            }
        }
    }, interval);
}

// Active ou désactive les boutons d'attaque
function toggleAttackButtons(disabled) {
    const buttons = document.querySelectorAll("#player-attacks button");
    buttons.forEach((button) => {
        button.disabled = disabled;
        button.style.opacity = disabled ? "0.5" : "1";
        button.style.cursor = disabled ? "not-allowed" : "pointer";
    });
}

// Attaque du joueur
function playerAttack(attack) {
    toggleAttackButtons(true); // Désactive les boutons d'attaque

    const damage = calculateDamage();

    const playerElement = document.getElementById("player");
    playerElement.classList.add("attacking");

    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("damaged");

    setTimeout(() => {
        playerElement.classList.remove("attacking");
        opponentElement.classList.remove("damaged");
    }, 1000);

    pokemonData.opponent.health = Math.max(0, pokemonData.opponent.health - damage);
    updateHealth("opponent", pokemonData.opponent.health);

    if (pokemonData.opponent.health > 0) {
        setTimeout(opponentAttack, 3000);
    }
}

// Attaque de l'adversaire
function opponentAttack() {
    const damage = calculateDamage();

    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("attacking");

    const playerElement = document.getElementById("player");
    playerElement.classList.add("damaged");

    setTimeout(() => {
        opponentElement.classList.remove("attacking");
        playerElement.classList.remove("damaged");
    }, 1000);

    pokemonData.player.health = Math.max(0, pokemonData.player.health - damage);
    updateHealth("player", pokemonData.player.health);

    setTimeout(() => toggleAttackButtons(false), 3000);
}

// Fonction pour infliger des dégâts aléatoires
function calculateDamage() {
    return Math.floor(Math.random() * 20) + 10; // Entre 10 et 30
}

// Charge le jeu
loadGameData();
