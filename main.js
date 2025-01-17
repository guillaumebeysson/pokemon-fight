// main.js
import { getPokemonData, getPokemonNameInFrench, getGenerationLimits, getRandomPokemonId } from "./api.js";
import { playerAttack, opponentAttack, checkGameOver } from "./gameLogic.js";
import { showLoader, showMainContent } from "./animations.js";

async function loadGameData() {
    showLoader();

    const [minId, maxId] = getGenerationLimits("all");
    const playerId = getRandomPokemonId(minId, maxId);
    const opponentId = getRandomPokemonId(minId, maxId);

    const [player, opponent] = await Promise.all([
        getPokemonData(playerId),
        getPokemonData(opponentId),
    ]);

    const [playerName, opponentName] = await Promise.all([
        getPokemonNameInFrench(playerId),
        getPokemonNameInFrench(opponentId),
    ]);

    player.name = playerName;
    opponent.name = opponentName;

    initializeGame(player, opponent);
    showMainContent();
}

// Charge le jeu
loadGameData();
