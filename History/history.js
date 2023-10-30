// Ambil data dari local storage
const player1Name = localStorage.getItem("player1Name");
const player2Name = localStorage.getItem("player2Name");
const p1Wins = localStorage.getItem("p1Wins");
const p2Wins = localStorage.getItem("p2Wins");
// const ties = localStorage.getItem("ties");

// Update elemen-elemen HTML dengan data dari local storage
document.getElementById("player1Name").textContent = player1Name || "-";
document.getElementById("player2Name").textContent = player2Name || "-";
document.getElementById("p1Wins").textContent = p1Wins || "0";
document.getElementById("p2Wins").textContent = p2Wins || "0";
// document.getElementById("ties").textContent = ties || "0";

// Simpan data lama di history
const history = JSON.parse(localStorage.getItem("history")) || [];

// Temukan elemen tabel di dalam HTML
const table = document.querySelector("table");

// Tambahkan data baru ke history jika belum ada
const newGameData = {
  player1Name,
  player2Name,
  p1Wins,
  p2Wins,
  // ties,
};

// Loop melalui setiap data permainan dalam riwayat dan tambahkan baris ke tabel
history.forEach((gameData) => {
  const row = table.insertRow();
  const player1NameCell = row.insertCell(0);
  const p1WinsCell = row.insertCell(1);
  // const tiesCell = row.insertCell(2);
  const p2WinsCell = row.insertCell(3);
  const player2NameCell = row.insertCell(4);

  player1NameCell.textContent = gameData.player1Name;
  player2NameCell.textContent = gameData.player2Name;
  p1WinsCell.textContent = gameData.p1Wins;
  p2WinsCell.textContent = gameData.p2Wins;
  // tiesCell.textContent = gameData.ties;
});

// Periksa apakah data sudah ada dalam riwayat sebelum menambahkannya
const isDuplicate = history.some((gameData) => {
  return gameData.player1Name === newGameData.player1Name && gameData.player2Name === newGameData.player2Name && gameData.p1Wins === newGameData.p1Wins && gameData.p2Wins === newGameData.p2Wins && gameData.ties === newGameData.ties;
});

if (!isDuplicate) {
  history.push(newGameData);
  localStorage.setItem("history", JSON.stringify(history));
}
