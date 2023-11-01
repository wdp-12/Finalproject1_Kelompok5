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
      name: gameInProgress ? localStorage.getItem("player2Name") : "Player 2", // Use stored name if game is in progress, or "Player 2" as default
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
    const player1Radio = document.getElementById("player1");
    const player2Radio = document.getElementById("player2");
    const player1NameInput = document.getElementById("playerName");
    const errorMessage = document.querySelector("[data-id='error-message']");

    const playerName = player1NameInput.value;

    if (!playerName) {
      errorMessage.textContent = "Harap isi nama player sebelum memulai permainan!";
      return;
    }

    if (!player1Radio.checked && !player2Radio.checked) {
      errorMessage.textContent = "Harap pilih giliran sebelum memulai permainan!";
      return;
    }

    errorMessage.textContent = "";

    if (player1Radio.checked) {
      players[0].name = playerName;
      players[1].name = "Computer";
    } else if (player2Radio.checked) {
      players[0].name = "Computer";
      players[1].name = playerName;
    }

    p1NameElement.textContent = players[0].name;
    p2NameElement.textContent = players[1].name;

    view.render(store.game, store.stats);

    const nameModal = document.querySelector(".name-modal");
    nameModal.classList.add("hidden");

    // Set the game in progress in local storage
    localStorage.setItem("gameInProgress", "true");
    localStorage.setItem("player1Name", players[0].name);
    localStorage.setItem("player2Name", players[1].name);

    // Pindahkan perintah berikut untuk memastikan komputer bergerak terlepas dari giliran pemain
    if (players[0].name === "Computer") {
      computerMove(store, view);
    }
  });

  view.bindGameResetEvent(() => {
    store.reset();
    if (store.game.currentPlayer.name === "Computer") {
      computerMove(store, view);
    }
  });

  view.bindNewRoundEvent((event) => {
    if (event.target.classList.contains("back-home-btn")) {
      // Clear the game state from local storage before resetting the game
      localStorage.removeItem("gameInProgress");
      store.newRound();

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

    if (existingMove || isWinner(store.game, store.game.currentPlayer)) {
      return;
    }

    store.playerMove(+square.id);

    if (isWinner(store.game, store.game.currentPlayer)) {
      view.render(store.game, store.stats);
      return; // Stop here if the player has won
    }
    // Cek jika giliran komputer setelah pemain bergerak
    if (store.game.currentPlayer.name === "Computer") {
      setTimeout(() => {
        computerMove(store, view);
      }, 1000); // Tambahkan penundaan untuk efek visual
    }
    playMoveSound();
  });
  // When the HTML document first loads, render the view based on the current state.
  view.render(store.game, store.stats);
}

function playMoveSound() {
  var moveSound = document.getElementById("moveSound");
  moveSound.play();
}

function computerMove(store, view) {
  const game = store.game;
  const emptySquares = Array.from(document.querySelectorAll('[data-id="square"]')).filter((square) => square.innerHTML === "");
  const currentPlayer = game.currentPlayer;
  const otherPlayer = store.players.find((player) => player !== currentPlayer);

  if (isWinner(game, currentPlayer) || isWinner(game, otherPlayer)) {
    return; // Stop the computer from making a move
  }

  // Fungsi untuk mendeteksi ancaman pemenang dan memblokir
  function blockThreat(threat) {
    for (const square of threat) {
      if (emptySquares.map((s) => +s.id).includes(square)) {
        const squareElement = emptySquares.find((s) => +s.id === square);
        squareElement.innerHTML = currentPlayer.imageSrc;
        game.moves.push({ squareId: +squareElement.id, player: currentPlayer });

        if (isWinner(game, currentPlayer)) {
          squareElement.click();
          return true;
        }

        squareElement.innerHTML = "";
        game.moves.pop();
      }
    }
    return false;
  }

  // Cek apakah komputer bisa menang dalam satu langkah
  for (const square of emptySquares) {
    square.innerHTML = currentPlayer.imageSrc;

    if (isWinner(game, currentPlayer)) {
      square.click();
      game.moves.push({ squareId: +square.id, player: currentPlayer });
      return;
    }

    square.innerHTML = "";
    game.moves.pop();
  }

  // Cek apakah pemain dapat menang dalam satu langkah, dan blokir jika perlu
  for (const square of emptySquares) {
    square.innerHTML = currentPlayer.imageSrc;
    game.moves.push({ squareId: +square.id, player: currentPlayer });

    if (isWinner(game, currentPlayer)) {
      square.click();
      game.moves.push({ squareId: +square.id, player: currentPlayer });

      return;
    }

    square.innerHTML = "";
    game.moves.pop();
  }

  // Blokir pemain yang hampir menang dalam baris, kolom, atau diagonal
  const threats = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  for (const threat of threats) {
    if (blockThreat(threat)) {
      return;
    }
  }

  // Blokir pemain yang memiliki dua langkah di sudut berbeda
  for (const corner of [1, 3, 7, 9]) {
    const cornerSquares = [corner, getAdjacentSquare(corner, 0)];
    const playerCornerMoves = game.moves.filter((move) => move.player === otherPlayer && cornerSquares.includes(move.squareId));

    if (playerCornerMoves.length === 2) {
      const availableSquares = emptySquares.filter((square) => cornerSquares.includes(+square.id));
      if (availableSquares.length > 0) {
        availableSquares[0].click();
        return;
      }
    }
  }

  // Blokir pemain yang memiliki dua langkah di sisi yang berbeda
  const playerMoves = game.moves.filter((move) => move.player === otherPlayer);
  for (const side of [2, 4, 6, 8]) {
    if (playerMoves.some((move) => move.squareId === side) && playerMoves.some((move) => move.squareId === getAdjacentSquare(side, 0)) && emptySquares.some((square) => +square.id === getAdjacentSquare(side, 1))) {
      emptySquares.find((square) => +square.id === getAdjacentSquare(side, 1)).click();
      return;
    }
  }

  // Jika belum ada pilihan yang lebih baik, pilih kotak tengah jika tersedia
  if (emptySquares.find((square) => +square.id === 5)) {
    emptySquares.find((square) => +square.id === 5).click();
    return;
  }

  // Jika tidak ada pilihan yang lebih baik, pilih kotak acak
  const randomIndex = Math.floor(Math.random() * emptySquares.length);
  emptySquares[randomIndex].click();
}

function isWinner(game, player) {
  const winningPatterns = [
    [1, 2, 3],
    [1, 5, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 5, 7],
    [3, 6, 9],
    [4, 5, 6],
    [7, 8, 9],
  ];

  for (const pattern of winningPatterns) {
    if (pattern.every((squareId) => game.moves.some((move) => move.player === player && move.squareId === squareId))) {
      return true;
    }
  }

  return false;
}

function getAdjacentSquare(square, direction) {
  switch (direction) {
    case 0: // Atas
      return square - 3;
    case 1: // Kanan
      return square + 1;
    case 2: // Bawah
      return square + 3;
    case 3: // Kiri
      return square - 1;
    default:
      return square;
  }
}

window.addEventListener("load", init);
