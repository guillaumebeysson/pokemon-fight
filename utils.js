// Génère un nombre aléatoire entre deux bornes
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calcule les dégâts en fonction d'une puissance et d'un facteur aléatoire
export function calculateDamage(power) {
    const randomFactor = Math.random() * 0.2 + 0.9;
    console.log("Dégâts infligés:", Math.round(power * randomFactor));
    return Math.round(power * randomFactor);
}
