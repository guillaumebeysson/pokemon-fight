// gameLogic.js
import { calculateDamage } from "./utils.js";
import { displayDamage, updateHealth, launchConfetti } from "./animations.js";
import { pokemonData } from "./data.js";
import { toggleAttackButtons } from "./utils.js";

export async function playerAttack(attack, opponent) {
    const damage = calculateDamage(attack.power);
    displayDamage("opponent", damage);

    const result = await updateHealth("opponent", Math.max(0, opponent.health - damage), opponent.maxHealth);
    return result;
}

export async function opponentAttack(opponent, player) {
    const attack = opponent.attacks[Math.floor(Math.random() * opponent.attacks.length)];
    const damage = calculateDamage(attack.power);
    displayDamage("player", damage);

    const result = await updateHealth("player", Math.max(0, player.health - damage), player.maxHealth);
    return result;
}

export function checkGameOver(player, opponent, winnerCallback) {
    if (player.health <= 0) {
        winnerCallback("opponent");
        return true;
    }
    if (opponent.health <= 0) {
        winnerCallback("player");
        return true;
    }
    return false;
}

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
