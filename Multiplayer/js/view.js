// This import is only for jsdoc typings and intellisense
import Store from "./store.js";

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

    // Element lists
    this.$$.squares = this.#qsAll('[data-id="square"]');

    // this.$.menuBtn.addEventListener("click", (event) => {
    //   this.#toggleMenu();
    // });
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
      } else {
        this.#openModal("Seri!");
        this.#showDrawImage(); // Menampilkan gambar "Draw.png"
      }
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

  //   #closeMenu() {
  //     this.$.menuItems.classList.add("hidden");
  //     this.$.menuBtn.classList.remove("border");

  //     const icon = this.$.menuBtn.querySelector("i");

  //     icon.classList.add("fa-chevron-down");
  //     icon.classList.remove("fa-chevron-up");
  //   }

  //   #toggleMenu() {
  //     this.$.menuItems.classList.toggle("hidden");
  //     this.$.menuBtn.classList.toggle("border");

  //     const icon = this.$.menuBtn.querySelector("i");

  //     icon.classList.toggle("fa-chevron-down");
  //     icon.classList.toggle("fa-chevron-up");
  //   }

  #handlePlayerMove(squareEl, player) {
    const image = document.createElement("img");
    image.src = player.imageSrc; // Ganti dengan sumber gambar yang sesuai
    squareEl.replaceChildren(image);
  }

  #setTurnIndicator(player) {
    const image = document.createElement("img");
    const label = document.createElement("p");

    image.src = player.imageSrc;

    //label.classList.add(player.colorClass);
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

  #delegate(el, selector, eventKey, handler) {
    el.addEventListener(eventKey, (event) => {
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
