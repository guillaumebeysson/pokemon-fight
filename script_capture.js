let captureValue = 100; // La barre commence à 100%
let isKO = false;

function updateCaptureBar() {
    const bar = document.getElementById("capture-bar");
    bar.style.width = `${captureValue}%`;

    if (captureValue > 50) {
        bar.style.backgroundColor = "#4caf50";
    } else if (captureValue > 20) {
        bar.style.backgroundColor = "#ff9800";
    } else {
        bar.style.backgroundColor = "#f44336";
    }

    if (captureValue <= 0 && !isKO) {
        isKO = true;
        showMessage("Le Pokémon est K.O. ! Vous ne pouvez pas l'attraper.");
        disableActions();
        document.getElementById("pokemon-img").style.opacity = "0.5";
        document.getElementById("restart-btn").style.display = "inline-block";
    }
}

function disableActions() {
    const buttons = document.querySelectorAll(".actions button");
    buttons.forEach(button => {
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
    });
}

function enableActions() {
    const buttons = document.querySelectorAll(".actions button");
    buttons.forEach(button => {
        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    });
}


function showMessage(text) {
    const message = document.getElementById("message");
    if (!message) return; // ✅ évite l'erreur si l'élément n'existe pas encore
    message.innerText = text;
}


function applyStatus(type) {
    if (isKO) return;

    if (type === "sleep") {
        captureValue -= 15;
        showMessage("Le Pokémon s'endort...");
        triggerAnimation("btn-sleep", "sleep-anim");
        animatePokemon("sleep-effect");
    } else if (type === "paralyze") {
        captureValue -= 10;
        showMessage("Le Pokémon est paralysé !");
        triggerAnimation("btn-paralyze", "shock-anim");
        animatePokemon("paralyze-effect");
    } else if (type === "attack") {
        captureValue -= 20;
        showMessage("Tu attaques le Pokémon !");
        triggerAnimation("btn-attack", "attack-anim");
        animatePokemon("attack-effect");
    }

    captureValue = Math.max(captureValue, 0);
    updateCaptureBar();

    if (captureValue === 0) {
        isKO = true;
        showMessage("❌ Le Pokémon est K.O. ! Vous ne pouvez plus l'attraper.");
        disableButtons();
    }
}

function tryCapture() {
    if (isKO) {
        showMessage("Le Pokémon est K.O. ! Vous ne pouvez pas lancer de Pokéball.");
        return;
    }

    const pokemonImg = document.getElementById("pokemon-img");
    const pokemonArea = document.querySelector(".pokemon-area");

    // 1. Cache le Pokémon
    pokemonImg.style.transition = "transform 0.5s, opacity 0.5s";
    pokemonImg.style.transform = "scale(0)";
    pokemonImg.style.opacity = "0";
    pokemonImg.style.display = "none";

    // 2. Supprime l'ancienne Pokéball
    const oldBall = document.getElementById("pokeball");
    if (oldBall) oldBall.remove();

    // 3. Pokéball aléatoire
    const balls = ["pokeball", "superball", "hyperball", "masterball"];
    const ballBonuses = {
        pokeball: 0,
        superball: 5,
        hyperball: 10,
        masterball: 20
    };

    const randomClass = balls[Math.floor(Math.random() * balls.length)];
    const ballBonus = ballBonuses[randomClass];

    const newBall = document.createElement("div");
    newBall.className = randomClass;
    newBall.id = "pokeball";
    pokemonArea.insertBefore(newBall, pokemonImg);

    // 4. Nouveau calcul du taux de capture 
    const baseChance = (100 - captureValue) / 4;
    const totalChance = Math.min(baseChance + ballBonus, 100);
    const chance = Math.random() * 100;

    // 🔍 Affiche dans la console
    console.log(`🎯 Capture avec une ${randomClass.toUpperCase()} :`);
    console.log(`- Base chance : ${baseChance.toFixed(2)}%`);
    console.log(`- Bonus : +${ballBonus}%`);
    console.log(`- Total chance : ${totalChance}%`);

    if (chance < totalChance) {
        setTimeout(() => {
            showMessage(`🎉 Tu as capturé le Pokémon avec une ${randomClass.toUpperCase()} !`);
            launchConfetti();
            disableButtons();
            document.getElementById("restart-btn").style.display = "block";
        }, 6000);
    } else {
        setTimeout(() => {
            showMessage(`💨 Le Pokémon s'est échappé de la ${randomClass.toUpperCase()} !`);
            captureValue = Math.min(captureValue + 70, 100);
            updateCaptureBar();

            newBall.classList.add("escape");

            setTimeout(() => {
                newBall.style.display = "none";
                pokemonImg.style.display = "inline-block";
                pokemonImg.style.transition = "transform 0.6s ease, opacity 0.6s ease";
                pokemonImg.style.transform = "scale(0)";
                pokemonImg.style.opacity = "0";

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        pokemonImg.style.transform = "scale(1)";
                        pokemonImg.style.opacity = "1";
                    });
                });
            }, 500);
        }, 5000);
    }
}




function disableButtons() {
    const buttons = document.querySelectorAll(".actions button");
    buttons.forEach(btn => btn.disabled = true);
}

async function restartGame() {
    captureValue = 100;
    isKO = false;

    const buttons = document.querySelectorAll(".actions button");
    buttons.forEach(btn => btn.disabled = false);

    document.getElementById("restart-btn").style.display = "none";
    document.querySelector(".container").style.display = "none";
    document.getElementById("loader").style.display = "block";
    document.getElementById("pokemon-img").style.display = "inline-block";
    document.getElementById("pokemon-img").style.opacity = "1";
    document.getElementById("pokemon-img").style.transform = "scale(1)";
    document.getElementById("pokeball").style.display = "none";

    const newId = Math.floor(Math.random() * 905) + 1;

    try {
        enableActions();
        const responsePokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${newId}`);
        const dataPokemon = await responsePokemon.json();

        const responseSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${newId}`);
        const dataSpecies = await responseSpecies.json();
        const frenchName = dataSpecies.names.find(n => n.language.name === "fr")?.name || dataSpecies.name;

        const imageUrl = dataPokemon.sprites.other["official-artwork"].front_default;

        // 🎯 MODAL LOGIC
        const modalWrapper = document.querySelector(".modal-wrapper");
        const modal = document.getElementById("appear-modal");
        const appearText = document.getElementById("appear-text");
        const appearImg = document.getElementById("appear-pokemon-img");

        // Reset
        modalWrapper.classList.remove("hidden");
        modal.classList.remove("disappear");
        appearImg.classList.remove("fall-appear");
        appearImg.src = "";

        // Show modal
        appearText.innerText = `Un ${frenchName} sauvage apparaît !`;
        modal.classList.remove("hidden");

        setTimeout(() => {
            appearImg.classList.add("fall-appear");
            appearImg.src = imageUrl;
        }, 1000);

        setTimeout(() => {
            modal.classList.add("disappear");
            document.getElementById("loader").style.display = "none";
            document.querySelector(".container").style.display = "block";
        }, 3000);

        setTimeout(() => {
            modalWrapper.classList.add("hidden");
        }, 4000);

        const imgElement = document.getElementById("pokemon-img");
        imgElement.onload = () => {
            document.querySelector(".container").style.display = "block";
            document.getElementById("loader").style.display = "none";
        };
        imgElement.src = imageUrl;

        document.getElementById("pokemon-name").innerText = frenchName;
        updateCaptureBar();
        showMessage(`Un ${frenchName} sauvage apparaît !`);

    } catch (error) {
        console.error("Erreur lors du chargement du Pokémon :", error);
        showMessage("Erreur lors du chargement d’un nouveau Pokémon.");
        document.getElementById("loader").style.display = "none";
    }
}


function triggerAnimation(buttonId, className) {
    const btn = document.getElementById(buttonId);
    btn.classList.add(className);
    setTimeout(() => {
        btn.classList.remove(className);
    }, 500);
}

function animatePokemon(effectClass) {
    const pokemonImg = document.getElementById("pokemon-img");
    pokemonImg.classList.add(effectClass);
    setTimeout(() => {
        pokemonImg.classList.remove(effectClass);
    }, 1000);
}

function launchConfetti() {
    const duration = 2 * 1000;
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
            origin: {
                x: Math.random(),

                y: Math.random() - 0.2,
            },
        });
    }, 200);
}

window.onload = () => {
    restartGame();
};

updateCaptureBar();
