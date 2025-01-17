import { getRandomInt } from "./utils.js";

// Limites des générations
const generationLimits = {
    all: [1, 905],
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025],
};

// Récupère les limites d'une génération
export function getGenerationLimits(gen) {
    return generationLimits[gen] || generationLimits["all"];
}

// Récupère un ID aléatoire dans les limites spécifiées
export function getRandomPokemonId(minId, maxId) {
    return getRandomInt(minId, maxId);
}

// Récupère les détails d'une attaque
export async function getAttackDetails(attackUrl) {
    try {
        const response = await fetch(attackUrl);
        const data = await response.json();
        const frenchName = data.names.find(name => name.language.name === "fr");
        return {
            name: frenchName ? frenchName.name : data.name,
            power: data.power || 0,
            type: data.type.name,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'attaque :", error);
        return null;
    }
}

// Récupère le nom en français d'un Pokémon
export async function getPokemonNameInFrench(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
        const data = await response.json();
        const frenchName = data.names.find(name => name.language.name === "fr");
        return frenchName ? frenchName.name : null;
    } catch (error) {
        console.error("Erreur lors de la récupération du nom en français :", error);
        return null;
    }
}

// Récupère les données d'un Pokémon
export async function getPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        const attacks = await Promise.all(
            data.moves.slice(0, 4).map(move => getAttackDetails(move.move.url))
        );

        const baseHP = data.stats.find(stat => stat.stat.name === "hp")?.base_stat || 100;

        return {
            img: data.sprites.front_default,
            attacks: attacks.filter(Boolean),
            health: baseHP,
            maxHealth: baseHP,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des données Pokémon :", error);
        return null;
    }
}
