document.getElementById("generation-form").addEventListener("submit", function (e) {
    const selected = document.querySelector("input[name='generation']:checked").value;
    if (selected === "imagine") {
        e.preventDefault();
        window.location.href = "select_imagined.html";
    } else if (!isNaN(parseInt(selected))) {
        // Redirection vers page de sélection d'une génération précise
        e.preventDefault();
        window.location.href = `select_generation.html?generation=${selected}`;
    } else {
        this.action = "game.html";
        this.submit();
    }
});
