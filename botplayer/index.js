const gameBoard = document.querySelector("#container") 
const infoDisplay = document.querySelector("#player") 
const startCells = [
    "", "", "", "","","","","",""
]


function createBoard() {
    startCells.forEach((cell, index)) => {
        const cellElement = document.createElement('div')
        cellElement.classList.add('square')
        gameBoard.append(cellElement)
    }
}