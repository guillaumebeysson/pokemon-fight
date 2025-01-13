// script.js

let pokemonData = { player: null, opponent: null };

// Affiche uniquement le loader
function showLoader() {
    document.getElementById("loader").style.display = "block";
    document.getElementById("main-content").classList.add("hidden");
}

// Affiche uniquement le contenu principal
function showMainContent() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("main-content").classList.remove("hidden");
}

// Récupère les paramètres de l'URL
const urlParams = new URLSearchParams(window.location.search);
const selectedGeneration = urlParams.get("generation") || "all";

// Fonction pour obtenir les limites des générations
function getGenerationLimits(gen) {
    const limits = {
        all: [1, 905], // Toutes les générations
        1: [1, 151],  // Première génération
        2: [152, 251], // Deuxième génération
        3: [252, 386], // Troisième génération
        4: [387, 493], // Quatrième génération
        5: [494, 649], // Cinquième génération
        6: [650, 721], // Sixième génération
        7: [722, 809], // Septième génération
        8: [810, 905], // Huitième génération
        9: [906, 1025], // Huitième génération
    };
    return limits[gen];
}

// Utilise les limites pour ajuster les IDs
const [minId, maxId] = getGenerationLimits(selectedGeneration);

// Modifie la fonction d'ID aléatoire pour tenir compte des limites
function getRandomPokemonId() {
    return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
}

// Fonction pour récupérer les détails des attaques via l'API
async function getAttackDetails(attackUrl) {
    try {
        const response = await fetch(attackUrl);
        const data = await response.json();

        const frenchName = data.names.find(name => name.language.name === "fr");
        return {
            name: frenchName ? frenchName.name : data.name,
            power: data.power / 4 || 0, // Puissance de l'attaque
            type: data.type.name // Type de l'attaque
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'attaque :", error);
        return null;
    }
}

// Fonction pour récupérer le nom en français d'un Pokémon
async function getPokemonNameInFrench(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du nom en français !");
        }
        const data = await response.json();
        const frenchName = data.names.find(name => name.language.name === "fr");
        return frenchName ? frenchName.name : null;
    } catch (error) {
        console.error("Erreur lors de la récupération du nom en français :", error);
        return null;
    }
}

// Fonction pour récupérer les données d'un Pokémon via PokéAPI
async function getPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données Pokémon !");
        }
        const data = await response.json();

        // Récupère les 4 premières attaques et leurs détails
        const attacks = await Promise.all(
            data.moves.slice(0, 4).map(move => getAttackDetails(move.move.url))
        );

        // Récupère les PV de base
        const baseHP = data.stats.find(stat => stat.stat.name === "hp")?.base_stat || 100;

        return {
            img: data.sprites.front_default,
            attacks: attacks.filter(attack => attack),
            health: baseHP,
            maxHealth: baseHP
        };
    } catch (error) {
        console.error("Impossible de récupérer les données d'un Pokémon :", error);
        return null;
    }
}

// Charge les données des Pokémon
async function loadGameData() {
    showLoader();

    const playerPokemonId = getRandomPokemonId();
    const opponentPokemonId = getRandomPokemonId();

    try {
        const [playerPokemon, opponentPokemon] = await Promise.all([
            getPokemonData(playerPokemonId),
            getPokemonData(opponentPokemonId)
        ]);

        const [playerName, opponentName] = await Promise.all([
            getPokemonNameInFrench(playerPokemonId),
            getPokemonNameInFrench(opponentPokemonId)
        ]);

        if (!playerPokemon || !opponentPokemon || !playerName || !opponentName) {
            alert("Erreur lors du chargement des données Pokémon.");
            return;
        }

        pokemonData.player = { ...playerPokemon, name: playerName };
        pokemonData.opponent = { ...opponentPokemon, name: opponentName };

        initializeGame();
    } catch (error) {
        console.error("Erreur lors du chargement des Pokémon :", error);
    } finally {
        showMainContent();
    }
}

// Initialise le jeu avec les données des Pokémon
function initializeGame() {
    document.getElementById("player-img").src = pokemonData.player.img;
    document.getElementById("opponent-img").src = pokemonData.opponent.img;
    document.querySelector("#player h2").innerText = pokemonData.player.name;
    document.querySelector("#opponent h2").innerText = pokemonData.opponent.name;

    const playerHealthBar = document.getElementById("player-health");
    const opponentHealthBar = document.getElementById("opponent-health");

    playerHealthBar.innerText = `${pokemonData.player.health} PV`;
    opponentHealthBar.innerText = `${pokemonData.opponent.health} PV`;

    const playerAttacks = document.getElementById("player-attacks");
    playerAttacks.innerHTML = "";
    pokemonData.player.attacks.forEach((attack) => {
        const button = document.createElement("button");
        button.innerText = attack.name;
        button.onclick = () => playerAttack(attack);
        playerAttacks.appendChild(button);
    });
}

// Met à jour la barre de vie avec animation
function updateHealth(pokemon, newHealth) {
    return new Promise(resolve => {
        const healthBar = document.getElementById(`${pokemon}-health`);
        const maxHealth = pokemonData[pokemon].maxHealth;
        const currentHealth = pokemonData[pokemon].health;
        const healthDifference = currentHealth - newHealth;
        const animationDuration = 1000;
        const interval = 10;

        let elapsedTime = 0;

        const intervalId = setInterval(() => {
            elapsedTime += interval;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            const interpolatedHealth = currentHealth - Math.round(healthDifference * progress);

            const healthPercentage = (interpolatedHealth / maxHealth) * 100;
            healthBar.style.width = `${Math.max(0, healthPercentage)}%`;
            healthBar.innerText = `${Math.max(0, interpolatedHealth)} PV`;

            // Change la couleur en fonction des PV
            if (healthPercentage > 50) {
                healthBar.style.backgroundColor = "#8cc776"; // Vert
            } else if (healthPercentage > 25) {
                healthBar.style.backgroundColor = "#ffa500"; // Orange
            } else {
                healthBar.style.backgroundColor = "#ff4500"; // Rouge
            }

            if (progress >= 1) {
                clearInterval(intervalId);
                pokemonData[pokemon].health = newHealth;

                if (newHealth <= 0) {
                    resolve("KO");
                } else {
                    resolve("CONTINUE");
                }
            }
        }, interval);
    });
}

// Vérifie et affiche le gagnant
function checkGameOver(pokemon) {
    if (pokemonData[pokemon].health <= 0) {
        displayWinner(pokemon === "player" ? "opponent" : "player");
        return true;
    }
    return false;
}

// Affiche le gagnant
function displayWinner(winner) {
    const winnerData = pokemonData[winner];
    const playerPokemon = pokemonData.player;
    const opponentPokemon = pokemonData.opponent;
    document.querySelector(".container").innerHTML = `
        <h1>${winner === "player" ? playerPokemon.name : opponentPokemon.name} a gagné !</h1>
        <img src="${winnerData.img}" alt="Gagnant" style="width: 200px;">
        <div class="reload">
            <button onclick="window.location.reload()">Rejouer</button>
        </div>`;
}

// Calcul des dégâts en fonction du power de l'attaque
function calculateDamage(power) {
    const randomFactor = Math.random() * 0.2 + 0.9;
    console.log("Dégâts infligés:", Math.round(power * randomFactor));
    return Math.round(power * randomFactor);
}

// Attaque du joueur
async function playerAttack(attack) {
    toggleAttackButtons(true);

    const damage = calculateDamage(attack.power);

    const playerElement = document.getElementById("player");
    playerElement.classList.add("attacking");

    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("damaged");

    setTimeout(() => {
        playerElement.classList.remove("attacking");
        opponentElement.classList.remove("damaged");
    }, 1000);

    const result = await updateHealth("opponent", Math.max(0, pokemonData.opponent.health - damage));

    if (result === "KO") {
        checkGameOver("opponent");
    } else {
        setTimeout(opponentAttack, 1000);
    }
}

// Attaque de l'adversaire
async function opponentAttack() {
    const randomAttack = pokemonData.opponent.attacks[
        Math.floor(Math.random() * pokemonData.opponent.attacks.length)
    ];

    const damage = calculateDamage(randomAttack.power);

    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("attacking");

    const playerElement = document.getElementById("player");
    playerElement.classList.add("damaged");

    setTimeout(() => {
        opponentElement.classList.remove("attacking");
        playerElement.classList.remove("damaged");
    }, 1000);

    const result = await updateHealth("player", Math.max(0, pokemonData.player.health - damage));

    if (result === "KO") {
        checkGameOver("player");
    } else {
        toggleAttackButtons(false);
    }
}

// Active ou désactive les boutons d'attaque
function toggleAttackButtons(disabled) {
    const buttons = document.querySelectorAll("#player-attacks button");
    buttons.forEach(button => {
        button.disabled = disabled;
        button.style.opacity = disabled ? "0.5" : "1";
        button.style.cursor = disabled ? "not-allowed" : "pointer";
    });
}

// Charge le jeu
loadGameData();
