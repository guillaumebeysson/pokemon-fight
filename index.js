document.getElementById("generation-form").addEventListener("submit", function (e) {
    const selected = document.querySelector("input[name='generation']:checked").value;
    if (selected === "imagine") {
        e.preventDefault();
        window.location.href = "select_imagined.html";
    } else {
        this.action = "game.html";
        this.submit();
    }
});
