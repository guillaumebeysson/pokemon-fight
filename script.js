// script.js

let pokemonData = { player: null, opponent: null };

// 📌 Ajout d'un typeChart pour gérer les faiblesses/résistances
const typeChart = {
    "normal": { "rock": 0.5, "ghost": 0, "steel": 0.5 },
    "fire": { "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "steel": 2, "fire": 0.5, "rock": 0.5, "dragon": 0.5 },
    "water": { "fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5 },
    "grass": { "fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5 },
    "electric": { "water": 2, "ground": 0, "flying": 2, "electric": 0.5, "dragon": 0.5 },
    "ice": { "fire": 0.5, "water": 0.5, "ice": 0.5, "fighting": 2, "rock": 2, "steel": 2 },
    "fighting": { "normal": 2, "ice": 2, "rock": 2, "ghost": 0, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "dark": 2, "steel": 2, "fairy": 0.5 },
    "poison": { "grass": 2, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2 },
    "ground": { "fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "rock": 2, "steel": 2 },
    "flying": { "electric": 0.5, "fighting": 2, "ground": 1, "grass": 2, "bug": 2, "rock": 0.5, "steel": 0.5 },
    "psychic": { "fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5 },
    "bug": { "fire": 0.5, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5 },
    "rock": { "normal": 0.5, "fire": 2, "water": 0.5, "grass": 0.5, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5 },
    "ghost": { "normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5 },
    "dragon": { "dragon": 2, "steel": 0.5, "fairy": 0 },
    "dark": { "fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5 },
    "steel": { "normal": 0.5, "fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "fighting": 0.5, "poison": 0, "ground": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5, "fairy": 2 },
    "fairy": { "fighting": 2, "poison": 0.5, "ghost": 1, "steel": 0.5, "dragon": 2, "dark": 2 }
};


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

// Fonction pour récupérer le type principal d'un Pokémon et charger l'icône
function setPokemonTypeIcon(pokemon, type) {
    const typeIconElement = document.getElementById(`${pokemon}-type-icon`);
    const typeContainer = document.getElementById(`${pokemon}-type-container`);
    typeContainer.className = "type-container";
    typeContainer.classList.add(type);
    typeIconElement.src = `assets/icons/${type}.svg`; // Chemin du fichier SVG
    typeIconElement.alt = `Type ${type}`;
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

// Fonction pour calculer l'effet du type de l'attaque contre le type du défenseur
function calculateTypeEffectiveness(attackType, defenderType) {
    return typeChart[attackType]?.[defenderType] || 1; // x1 par défaut
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

        const attacks = await Promise.all(
            data.moves.slice(0, 4).map(move => getAttackDetails(move.move.url))
        );

        const baseHP = data.stats.find(stat => stat.stat.name === "hp")?.base_stat || 100;
        const baseDefense = data.stats.find(stat => stat.stat.name === "defense")?.base_stat || 50;
        const type = data.types[0]?.type.name || "normal"; // Prend le premier type du Pokémon

        return {
            img: data.sprites.other["official-artwork"].front_default,
            attacks: attacks.filter(attack => attack),
            health: baseHP,
            maxHealth: baseHP,
            defense: baseDefense,
            type: type
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
    //const playerPokemonId = 868; // Cremy pour tester l'attaque soin
    //const playerPokemonId = 132; // pour tester métamorph
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
    initializeScores();
    updateScoreDisplay(
        parseInt(localStorage.getItem("currentWinStreak"), 10),
        parseInt(localStorage.getItem("maxWinStreak"), 10)
    );

    document.getElementById("player-img").src = pokemonData.player.img;
    document.getElementById("opponent-img").src = pokemonData.opponent.img;
    document.querySelector("#player h2").innerText = pokemonData.player.name;
    document.querySelector("#opponent h2").innerText = pokemonData.opponent.name;

    setPokemonTypeIcon("player", pokemonData.player.type);
    setPokemonTypeIcon("opponent", pokemonData.opponent.type);

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

    const winningPokemonName = winner === "player" ? playerPokemon.name : opponentPokemon.name;

    // Mets à jour les scores
    updateScores(winner === "player");

    // Lance les confettis si le joueur gagne
    if (winner === "player") {
        launchConfetti();
    }

    document.querySelector(".container").innerHTML = `
        <h1>${winner === "player" ? playerPokemon.name : opponentPokemon.name} a gagné !</h1>
        <img src="${winnerData.img}" class="winner" alt="Gagnant" style="width: 200px;">
        <div class="reload">
            <button onclick="window.location.reload()">Rejouer</button>
        </div>`;
}

// Calcul des dégâts en fonction du power de l'attaque
function calculateDamage(attacker, defender, attack) {
    const randomFactor = Math.random() * 0.2 + 0.9; // Variation entre 90% et 110%
    const effectiveness = calculateTypeEffectiveness(attack.type, defender.type);
    const baseDamage = Math.round(attack.power * randomFactor * effectiveness);

    console.log(
        `${attack.name} inflige ${baseDamage} dégâts (${effectiveness}x) sur ${defender.type}`
    );

    return baseDamage;
}

// Fonction pour afficher les dégâts infligés
function displayDamage(pokemon, damage) {
    const healthBar = document.querySelector(`#${pokemon} .pokemon-img`); // Récupère la barre de vie
    const damageElement = document.createElement("div");

    // Style de l'élément des dégâts
    damageElement.innerText = `-${damage}`;
    damageElement.style.position = "absolute";
    damageElement.style.top = "50px"; // Décalage vers le haut
    damageElement.style.right = "30px";
    damageElement.style.color = "red";
    damageElement.style.fontWeight = "bold";
    damageElement.style.fontSize = "1.6rem";
    damageElement.style.animation = "fade-out 1.5s forwards"; // Animation CSS
    damageElement.style.zIndex = "999";

    // Insère l'élément après la barre de vie
    healthBar.insertAdjacentElement("afterend", damageElement);

    // Retire l'élément après l'animation
    setTimeout(() => {
        damageElement.remove();
    }, 1500);
}


// Attaque du joueur
async function playerAttack(attack) {
    toggleAttackButtons(true);

    // 🟢 Gestion de l'attaque "Soin"
    if (attack.name.toLowerCase() === "soin" || attack.name.toLowerCase() === "repos") {
        // Restaure 50 PV sans dépasser les PV max
        const healedHealth = Math.min(pokemonData.player.health + 50, pokemonData.player.maxHealth);

        // Affiche l'animation de soin
        displayHealing("player", healedHealth - pokemonData.player.health);

        await updateHealth("player", healedHealth);

        // Passe à l'attaque de l'adversaire après le soin
        setTimeout(opponentAttack, 1000);
        return;
    }

    // 🌀 Vérifie si l'attaque est "Morphing" et transforme Métamorph
    if (attack.name.toLowerCase() === "morphing") {
        transformDitto();
        setTimeout(() => toggleAttackButtons(false), 1000);
        return;
    }

    // 💥 Calcul des dégâts avec prise en compte des résistances et de la défense
    const damage = calculateDamage(pokemonData.player, pokemonData.opponent, attack);

    // 📢 Affichage de l'animation d'attaque
    const playerElement = document.getElementById("player");
    playerElement.classList.add("attacking");

    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("damaged");

    // Affiche les dégâts sur l'adversaire
    displayDamage("opponent", damage);

    // ⏳ Supprime les classes d'animation après un délai
    setTimeout(() => {
        playerElement.classList.remove("attacking");
        opponentElement.classList.remove("damaged");
    }, 1000);

    // ⚔️ Mise à jour des PV de l'adversaire
    const result = await updateHealth("opponent", Math.max(0, pokemonData.opponent.health - damage));

    // 🏆 Vérifie si l'adversaire est KO
    if (result === "KO") {
        checkGameOver("opponent");
    } else {
        setTimeout(opponentAttack, 1000);
    }
}


// Attaque de l'adversaire
async function opponentAttack() {
    // 🎯 Sélection aléatoire d'une attaque parmi toutes les attaques (même celles avec 0 de dégâts)
    const randomAttack = pokemonData.opponent.attacks[
        Math.floor(Math.random() * pokemonData.opponent.attacks.length)
    ];

    console.log(`${pokemonData.opponent.name} utilise ${randomAttack.name} !`);

    // 💥 Calcul des dégâts (même si l'attaque a 0 de puissance)
    const damage = calculateDamage(pokemonData.opponent, pokemonData.player, randomAttack);

    console.log(`${randomAttack.name} inflige ${damage} dégâts à ${pokemonData.player.name}`);

    // 📢 Animation d'attaque
    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("attacking");

    const playerElement = document.getElementById("player");
    playerElement.classList.add("damaged");

    // Affiche les dégâts sur le joueur (même s'ils sont 0)
    displayDamage("player", damage);

    // ⏳ Retire les animations après un délai
    setTimeout(() => {
        opponentElement.classList.remove("attacking");
        playerElement.classList.remove("damaged");
    }, 1000);

    // ⚔️ Mise à jour des PV du joueur
    const result = await updateHealth("player", Math.max(0, pokemonData.player.health - damage));

    // 🏆 Vérifie si le joueur est KO
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

// Fonction pour afficher les confettis
function launchConfetti() {
    const duration = 2 * 1000; // Durée totale des confettis (2 secondes)
    const end = Date.now() + duration;

    // Lancer des confettis à intervalles réguliers
    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval);
            return;
        }

        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: {
                x: Math.random(),
                // L'origine Y permet d'ajuster la hauteur de lancement des confettis
                y: Math.random() - 0.2,
            },
        });
    }, 200); // Lance des confettis toutes les 250ms
}

// Initialise ou récupère les scores dans le Local Storage
function initializeScores() {
    if (!localStorage.getItem("currentWinStreak")) {
        localStorage.setItem("currentWinStreak", "0");
    }
    if (!localStorage.getItem("maxWinStreak")) {
        localStorage.setItem("maxWinStreak", "0");
    }
}

// Met à jour les scores
function updateScores(won) {
    let currentWinStreak = parseInt(localStorage.getItem("currentWinStreak"), 10);
    let maxWinStreak = parseInt(localStorage.getItem("maxWinStreak"), 10);

    if (won) {
        currentWinStreak++;
        if (currentWinStreak > maxWinStreak) {
            maxWinStreak = currentWinStreak;
        }
    } else {
        currentWinStreak = 0; // Réinitialise la série en cas de défaite
    }

    // Mets à jour le Local Storage
    localStorage.setItem("currentWinStreak", currentWinStreak.toString());
    localStorage.setItem("maxWinStreak", maxWinStreak.toString());

    // Mets à jour l'affichage
    updateScoreDisplay(currentWinStreak, maxWinStreak);
}

// Affiche les scores sur l'interface
function updateScoreDisplay(current, max) {
    document.getElementById("current-streak").innerText = `Victoires consécutives : ${current}`;
    document.getElementById("max-streak").innerText = `Record : ${max}`;
}

// Fonction pour afficher l'effet de soin
function displayHealing(pokemon, healAmount) {
    const healthBar = document.querySelector(`#${pokemon} .pokemon-img`);
    const healElement = document.createElement("div");

    // Style du texte de soin
    healElement.innerText = `+${healAmount}`;
    healElement.style.position = "absolute";
    healElement.style.top = "50px";
    healElement.style.right = "30px";
    healElement.style.color = "green"; // Vert pour le soin
    healElement.style.fontWeight = "bold";
    healElement.style.fontSize = "1.2rem";
    healElement.style.animation = "fade-out 1.5s forwards";

    // Insère l'élément
    healthBar.insertAdjacentElement("afterend", healElement);

    // Retire après l'animation
    setTimeout(() => {
        healElement.remove();
    }, 1500);
}

// Fonction pour transformer Métamorph en son adversaire avec animation
function transformDitto() {
    const ditto = pokemonData.player;
    const opponent = pokemonData.opponent;

    // Vérifie si le Pokémon du joueur est Métamorph (ID 132)
    if (ditto.name.toLowerCase() === "métamorph") {
        const playerElement = document.getElementById("player");
        const playerImage = document.getElementById("player-img");

        // Ajoute la classe pour l'animation
        playerElement.classList.add("transforming");

        // Attends la fin de l'animation avant d'appliquer la transformation
        setTimeout(() => {
            ditto.img = opponent.img;
            ditto.health = opponent.health * 2; // Double les PV de l'adversaire
            ditto.maxHealth = opponent.maxHealth * 2;
            ditto.attacks = [...opponent.attacks]; // Copie les attaques de l'adversaire
            ditto.name = `Métamorph (${opponent.name})`; // Met à jour le nom affiché

            // Mise à jour de l'affichage
            playerImage.src = ditto.img;
            document.querySelector("#player h2").innerText = ditto.name;
            updateHealth("player", ditto.health);

            // Met à jour les attaques affichées
            const playerAttacks = document.getElementById("player-attacks");
            playerAttacks.innerHTML = "";
            ditto.attacks.forEach((attack) => {
                const button = document.createElement("button");
                button.innerText = attack.name;
                button.onclick = () => playerAttack(attack);
                playerAttacks.appendChild(button);
            });

            // Retire la classe après l'animation
            setTimeout(() => {
                playerElement.classList.remove("transforming");
            }, 500);

            console.log("Métamorph s'est transformé en", opponent.name);
        }, 1500); // Temps de l'animation avant transformation
    }
}






// Charge le jeu
loadGameData();
