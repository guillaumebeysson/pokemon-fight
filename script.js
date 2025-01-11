// script.js

// Données des Pokémon (tu peux enrichir cela avec l'API PokéAPI)
const pokemonData = {
    player: {
        name: "Pikachu",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        attacks: ["Charge", "Éclair", "Vive-Attaque", "Tonnerre"],
        health: 100,
    },
    opponent: {
        name: "Carapuce",
        img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
        health: 100,
    },
};

// Initialisation des Pokémon
document.getElementById("player-img").src = pokemonData.player.img;
document.getElementById("opponent-img").src = pokemonData.opponent.img;

// Ajout des attaques du joueur
const playerAttacks = document.getElementById("player-attacks");
pokemonData.player.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerText = attack;
    button.onclick = () => playerAttack(attack);
    playerAttacks.appendChild(button);
});

// Fonction pour mettre à jour la barre de vie
function updateHealth(pokemon, newHealth) {
    const healthBar = document.getElementById(`${pokemon}-health`);
    const currentHealth = parseInt(healthBar.style.width); // Récupère la largeur actuelle en %
    const healthDifference = currentHealth - newHealth; // Différence entre la santé actuelle et la nouvelle santé

    let elapsedTime = 0; // Temps écoulé pour l'animation
    const animationDuration = 2000; // Durée totale de l'animation (1s)
    const interval = 10; // Intervalle entre chaque mise à jour (10ms)

    // Anime la diminution de la barre de vie
    const intervalId = setInterval(() => {
        elapsedTime += interval;
        const progress = Math.min(elapsedTime / animationDuration, 1); // Progrès entre 0 et 1
        const interpolatedHealth = currentHealth - progress * healthDifference; // Santé intermédiaire
        healthBar.style.width = `${Math.max(0, interpolatedHealth)}%`; // Mise à jour de la largeur
        healthBar.innerText = `${Math.round(interpolatedHealth)} PV`;

        // Arrête l'animation quand elle est terminée
        if (progress >= 1) {
            clearInterval(intervalId);

            // Si la santé atteint 0, afficher le message de fin
            if (newHealth <= 0) {
                healthBar.innerText = "KO!";
                const winner = pokemon === "player" ? "opponent" : "player";
                const winnerData = pokemon === "player" ? pokemonData.opponent : pokemonData.player;

                // Affiche le gagnant
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

// Attaque du joueur
function playerAttack(attack) {
    const damage = calculateDamage();

    // Agrandit le Pokémon joueur
    const playerElement = document.getElementById("player");
    playerElement.classList.add("attacking");

    // Tremblement du Pokémon adversaire
    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("damaged");

    // Retire les classes après les animations
    setTimeout(() => {
        playerElement.classList.remove("attacking");
        opponentElement.classList.remove("damaged");
    }, 3000); // Durée de l'animation (1s)

    // Applique les dégâts
    pokemonData.opponent.health = Math.max(0, pokemonData.opponent.health - damage);
    updateHealth("opponent", pokemonData.opponent.health);

    // Vérifie si l'adversaire est toujours en vie
    if (pokemonData.opponent.health > 0) {
        setTimeout(opponentAttack, 4000); // L'adversaire attaque après 4 seconde
    }
}

// Attaque de l'adversaire
function opponentAttack() {
    const damage = calculateDamage();

    // Agrandit le Pokémon adversaire
    const opponentElement = document.getElementById("opponent");
    opponentElement.classList.add("attacking");

    // Tremblement du Pokémon joueur
    const playerElement = document.getElementById("player");
    playerElement.classList.add("damaged");

    // Retire les classes après les animations
    setTimeout(() => {
        opponentElement.classList.remove("attacking");
        playerElement.classList.remove("damaged");
    }, 3000); // Durée de l'animation (1s)

    // Applique les dégâts
    pokemonData.player.health = Math.max(0, pokemonData.player.health - damage);
    updateHealth("player", pokemonData.player.health);
}


// Fonction pour infliger des dégâts aléatoires
function calculateDamage() {
    return Math.floor(Math.random() * 20) + 10; // Entre 10 et 30
}

