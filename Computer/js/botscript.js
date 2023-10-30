import Store from "./botstore.js";
import View from "./botview.js";

function init() {
  // Check if the game is in progress based on local storage
  const gameInProgress = localStorage.getItem("gameInProgress") === "true";

  // "Model"
  const players = [
    {
      id: 1,
      name: gameInProgress ? localStorage.getItem("player1Name") : "Player 1", // Use stored name if game is in progress, or "Player 1" as default
      imageSrc: "../../asset/X.png",
    },
    {
      id: 2,
      name: gameInProgress ? localStorage.getItem("player2Name") : "Computer", // Use stored name if game is in progress, or "Player 2" as default
      imageSrc: "../../asset/O.png",
    },
  ];

  const store = new Store("game-state-key", players);

  // "View"
  const view = new View();

  if (gameInProgress) {
    const nameModal = document.querySelector(".name-modal");
    nameModal.classList.add("hidden");
  }

  const p1NameElement = document.querySelector("[data-id='p1-name']");
  const p2NameElement = document.querySelector("[data-id='p2-name']");

  p1NameElement.textContent = players[0].name;
  p2NameElement.textContent = players[1].name;

  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  window.addEventListener("storage", () => {
    console.log("State changed from another tab");
    view.render(store.game, store.stats);
  });

  view.bindStartGameEvent(() => {
    const player1NameInput = document.getElementById("player1Name");
    const player2NameInput = document.getElementById("player2Name");
    const errorMessage = document.querySelector("[data-id='error-message']");

    const player1Name = player1NameInput.value;
    const player2Name = player2NameInput.value;

    if (!player1Name || !player2Name) {
      errorMessage.textContent = "Harap isi nama player sebelum memulai permainan!";
      return;
    }

    errorMessage.textContent = "";

    players[0].name = player1Name;
    players[1].name = player2Name;

    p1NameElement.textContent = players[0].name;
    p2NameElement.textContent = players[1].name;

    view.render(store.game, store.stats);

    const nameModal = document.querySelector(".name-modal");
    nameModal.classList.add("hidden");

    // Set the game in progress in local storage
    localStorage.setItem("gameInProgress", "true");
    localStorage.setItem("player1Name", players[0].name);
    localStorage.setItem("player2Name", players[1].name);
  });

  view.bindGameResetEvent(() => {
    store.reset();

    // // Reset the game in progress when the game is reset
    // localStorage.removeItem("gameInProgress");
  });

  view.bindNewRoundEvent((event) => {
    if (event.target.classList.contains("back-home-btn")) {
      // Clear the game state from local storage before resetting the game
      localStorage.removeItem("gameInProgress");
      store.newRound();

      // Clear player scores when going back home
      localStorage.removeItem("player1Score");
      localStorage.removeItem("player2Score");

      // Reset player scores
      players[0].score = 0;
      players[1].score = 0;

      // Reset draw score
      stats.ties = 0;

      // Update the view with the new scores
      view.render(store.game, stats);

      const nameModal = document.querySelector(".name-modal");
      nameModal.classList.remove("hidden");
    } else {
      store.reset();
    }
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find((move) => move.squareId === +square.id);

    if (existingMove) {
      return;
    }

    store.playerMove(+square.id);
  });

  // When the HTML document first loads, render the view based on the current state.
  view.render(store.game, store.stats);
}

window.addEventListener("load", init);

