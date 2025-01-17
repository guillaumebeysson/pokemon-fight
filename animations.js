// Met à jour la barre de vie avec animation
export function updateHealth(pokemon, newHealth, maxHealth) {
    return new Promise(resolve => {
        const healthBar = document.getElementById(`${pokemon}-health`);
        const currentHealth = parseInt(healthBar.dataset.health, 10);
        const healthDifference = currentHealth - newHealth;
        const duration = 1000;
        const interval = 10;
        let elapsed = 0;

        const intervalId = setInterval(() => {
            elapsed += interval;
            const progress = Math.min(elapsed / duration, 1);
            const interpolatedHealth = currentHealth - Math.round(healthDifference * progress);
            const healthPercentage = (interpolatedHealth / maxHealth) * 100;

            healthBar.style.width = `${Math.max(0, healthPercentage)}%`;
            healthBar.innerText = `${Math.max(0, interpolatedHealth)} PV`;

            if (progress >= 1) {
                clearInterval(intervalId);
                healthBar.dataset.health = newHealth;
                resolve(newHealth <= 0 ? "KO" : "CONTINUE");
            }
        }, interval);
    });
}

// Affiche les dégâts infligés
export function displayDamage(pokemon, damage) {
    const healthBar = document.querySelector(`#${pokemon} .pokemon-img`);
    const damageElement = document.createElement("div");
    damageElement.innerText = `-${damage}`;
    damageElement.className = "damage-display";
    healthBar.insertAdjacentElement("afterend", damageElement);

    setTimeout(() => {
        damageElement.remove();
    }, 1500);
}

// Lance les confettis
export function launchConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval);
            return;
        }

        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
    }, 200);
}

// Fonction pour afficher le loader
export function showLoader() {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    if (loader && mainContent) {
        loader.style.display = "block";
        mainContent.classList.add("hidden");
    }
}

// Fonction pour masquer le loader
export function showMainContent() {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    if (loader && mainContent) {
        loader.style.display = "none";
        mainContent.classList.remove("hidden");
    }
}

