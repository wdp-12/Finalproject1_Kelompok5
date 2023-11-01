export default class View {
  $ = {};
  $$ = {};

  constructor() {
    // Single elements
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.modal = this.#qs('[data-id="modal"]');
    this.$.modalText = this.#qs('[data-id="modal-text"]');
    this.$.modalBtn = this.#qs('[data-id="modal-btn"]');
    this.$.turn = this.#qs('[data-id="turn"]');
    this.$.p1Wins = this.#qs('[data-id="p1-wins"]');
    this.$.p2Wins = this.#qs('[data-id="p2-wins"]');
    this.$.ties = this.#qs('[data-id="ties"]');
    this.$.grid = this.#qs('[data-id="grid"]');
    this.$.winningSound = document.getElementById("winningSound");
    this.$.drawSound = document.getElementById("drawSound");

    // Element lists
    this.$$.squares = this.#qsAll('[data-id="square"]');
  }

  render(game, stats) {
    const { playerWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner },
    } = game;

    this.#closeAll();
    this.#clearMoves();
    this.#updateScoreboard(playerWithStats[0].wins, playerWithStats[1].wins, ties);
    this.#initializeMoves(moves);

    if (isComplete) {
      if (winner) {
        this.#openModal(`${winner.name} Menang!`);
        this.#showWinImage(); // Menampilkan gambar "Win.png"

        this.$.winningSound.play();
        // Perbarui skor pemain yang menang
        if (winner.id === 1) {
          playerWithStats[0].wins += 1;
        } else if (winner.id === 2) {
          playerWithStats[1].wins += 1;
        }
      } else {
        this.#openModal("Seri!");
        this.#showDrawImage(); // Menampilkan gambar "Draw.png"

        this.$.drawSound.play();
        // Perbarui skor seri
        stats.ties += 1;

        localStorage.setItem("ties", stats.ties);
      }

      // Perbarui skor di local storage
      localStorage.setItem("p1Wins", playerWithStats[0].wins);
      localStorage.setItem("p2Wins", playerWithStats[1].wins);
      localStorage.setItem("ties", stats.ties);

      console.log("Before reassignment");
      console.log(playerWithStats[0].wins, playerWithStats[1].wins, stats.ties);
      console.log("After reassignment");

      this.#updateScoreboard(playerWithStats[0].wins, playerWithStats[1].wins, stats.ties);
      return;
    }

    this.#setTurnIndicator(currentPlayer);
  }

  #showWinImage() {
    const image = document.createElement("img");
    image.src = "../../asset/Win.png"; // Ganti dengan path yang sesuai
    this.$.modalText.appendChild(image);
  }

  #showDrawImage() {
    const image = document.createElement("img");
    image.src = "../../asset/Draw.png"; // Ganti dengan path yang sesuai
    this.$.modalText.appendChild(image);
  }

  bindStartGameEvent(callback) {
    const startGameBtn = document.getElementById("startGameBtn");
    startGameBtn.addEventListener("click", callback);
  }

  bindGameResetEvent(handler) {
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler) {
    this.$$.squares.forEach((square) => {
      square.addEventListener("click", () => {
        if (square.innerHTML === "") {
          // Periksa apakah kotak kosong
          handler(square);
        }
      });
    });
  }

  #updateScoreboard(p1Wins, p2Wins, ties) {
    this.$.p1Wins.innerText = `${p1Wins}`;
    this.$.p2Wins.innerText = `${p2Wins}`;
    this.$.ties.innerText = `${ties}`;
  }

  #openModal(message) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.innerText = message;
  }

  #closeAll() {
    this.#closeModal();
  }

  #clearMoves() {
    this.$$.squares.forEach((square) => {
      square.replaceChildren();
    });
  }

  #initializeMoves(moves) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);

      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #handlePlayerMove(squareEl, player) {
    const image = document.createElement("img");
    image.src = player.imageSrc; // Ganti dengan sumber gambar yang sesuai
    squareEl.replaceChildren(image);
  }

  #setTurnIndicator(player) {
    const image = document.createElement("img");
    const label = document.createElement("p");

    image.src = player.imageSrc;

    label.innerText = `Giliran ${player.name}`;

    this.$.turn.replaceChildren(image, label);
  }

  #qs(selector, parent) {
    const el = parent ? parent.querySelector(selector) : document.querySelector(selector);

    if (!el) throw new Error("Could not find element");

    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);

    if (!elList) throw new Error("Could not find elements");

    return elList;
  }
}
