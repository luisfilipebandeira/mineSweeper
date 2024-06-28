document.getElementById("createGameButton").addEventListener("click", () => {
    validateInputs()
});

let highScore = {
    gameName: "First Game",
    score: 0,
    gameBoard: null
};

let oldCol = 0;
let oldRow = 0;

function validateInputs() {
    let gameName = document.getElementById("gameName").value;
    let numRows = parseInt(document.getElementById("numRows").value);
    let numCols = parseInt(document.getElementById("numCols").value);
    let numMines = parseInt(document.getElementById("numMines").value);

    if (gameName === "") {
        alert("Game name is required.");
        return ;
    }

    if (isNaN(numRows) || numRows < 4) {
        numRows = 4;
        document.getElementById("numRows").value = 4;
    }
    if (isNaN(numCols) || numCols < 4) {
        numCols = 4;
        document.getElementById("numCols").value = 4;
    }
    if (isNaN(numMines) || numMines < 4) {
        numMines = 1;
        document.getElementById("numMines").value = 4;
    }
    if (numMines >= numRows * numCols) {
        numMines = numRows * numCols - 1;
        document.getElementById("numMines").value = numMines;
    }

    createGame(gameName, numRows, numCols, numMines);
}

function createGame(gameName, numRows, numCols, numMines) {
    const gameBoard = document.createElement("div");
    gameBoard.className = `board`;
    gameBoard.setAttribute("title", gameName);
    gameBoard.setAttribute("data-rows", numRows);
    gameBoard.setAttribute("data-cols", numCols);
    gameBoard.setAttribute("data-mines", numMines);
    gameBoard.setAttribute("tabindex", "0");
    document.getElementById("gamesContainer").appendChild(gameBoard);

    const board = initializeBoard(numRows, numCols, numMines);
    renderBoard(gameBoard, board, numRows, numCols);

    gameBoard.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            handleEnterKeyPress(board, event, numRows, numCols, gameBoard);
        } else {
            handleKeyPress(event, board, numRows, numCols, gameBoard);
        }
    });
}

function initializeBoard(numRows, numCols, numMines) {
    const board = [];
    for (let i = 0; i < numRows; i++) {
        board[i] = [];
        for (let j = 0; j < numCols; j++) {
            board[i][j] = {
                isMine: false,
                revealed: false,
                flagged: false,
                count: 0,
            };
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < numMines) {
        const row = Math.floor(Math.random() * numRows);
        const col = Math.floor(Math.random() * numCols);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (!board[i][j].isMine) {
                let count = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const ni = i + dx;
                        const nj = j + dy;
                        if (ni >= 0 && ni < numRows && nj >= 0 && nj < numCols && board[ni][nj].isMine) {
                            count++;
                        }
                    }
                }
                board[i][j].count = count;
            }
        }
    }

    return board;
}

function revealCell(board, numRows, numCols, gameBoard, row, col) {
    if (row < 0 || row >= numRows || col < 0 || col >= numCols || board[row][col].revealed || board[row][col].flagged) {
        return;
    }

    board[row][col].revealed = true;

    if (board[row][col].isMine) {
        showModal("Game Over! You stepped on a mine.");
        revealAllMines(board, numRows, numCols);
        gameBoard.classList.add("blocked");
        renderBoard(gameBoard, board, numRows, numCols);
        return;
    } else if (board[row][col].count === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                revealCell(board, numRows, numCols, gameBoard, row + dx, col + dy);
            }
        }
    }

    renderBoard(gameBoard, board, numRows, numCols);

    if (checkWin(board, numRows, numCols)) {
        const score = calculateScore(board);
        if (score > highScore.score) {
        
            if (highScore.gameBoard) {
                highScore.gameBoard.classList.remove("highScoreHighlight");
            }
            
            highScore.gameName = gameBoard.getAttribute("title");
            highScore.score = score;
            highScore.gameBoard = gameBoard;
            updateHighScoreDisplay();
        }
        gameBoard.classList.add("blocked");
        showModal("Congratulations! You won the game.");
    }
}

function toggleFlag(board, numRows, numCols, gameBoard, row, col, event) {
    event.preventDefault();
    if (!board[row][col].revealed) {
        board[row][col].flagged = !board[row][col].flagged;
        renderBoard(gameBoard, board, numRows, numCols);
    }
}

function renderBoard(gameBoard, board, numRows, numCols) {
    gameBoard.innerHTML = "";

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.setAttribute("data-row", i);
            cell.setAttribute("data-col", j);

            if (board[i][j].revealed) {
                cell.classList.add("revealed");
                if (board[i][j].isMine) {
                    cell.classList.add("mine");
                    cell.textContent = "💣";
                    gameBoard.classList.add("blocked");
                    const score = calculateScore(board);
                if (score > highScore.score) {
                
                    if (highScore.gameBoard) {
                        highScore.gameBoard.classList.remove("highScoreHighlight");
                    }
                    
                    highScore.gameName = gameBoard.getAttribute("title");
                    highScore.score = score;
                    highScore.gameBoard = gameBoard;
                    updateHighScoreDisplay();
                }
                } else {
                    cell.textContent = board[i][j].count || "";
                }
            } else if (board[i][j].flagged) {
                cell.classList.add("flagged");
                cell.textContent = "🚩";
            }

            cell.addEventListener("click", () => {
                oldRow = i;
                oldCol = j;
                revealCell(board, numRows, numCols, gameBoard, i, j);
            });

            cell.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                toggleFlag(board, numRows, numCols, gameBoard, i, j, event);
            });

            gameBoard.appendChild(cell);
        }
        const br = document.createElement("div");
        br.style.clear = "both";
        gameBoard.appendChild(br);
    }

    const firstCell = gameBoard.querySelector(`.cell[data-row='${oldRow}'][data-col='${oldCol}']`);
    if (firstCell) {
        firstCell.setAttribute("tabindex", "0");
        firstCell.focus();
    }
}

function checkWin(board, numRows, numCols) {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (!board[i][j].isMine && !board[i][j].revealed) {
                return false;
            }
        }
    }
    return true;
}

function calculateScore(board) {
    let score = 0;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].revealed && !board[i][j].isMine) {
                score++;
            }
        }
    }
    return score;
}

function updateHighScoreDisplay() {

    document.getElementById("highScoreValue").textContent = `Game: ${highScore.gameName}, Score: ${highScore.score}`;
    
    
    if (highScore.gameBoard) {
        highScore.gameBoard.classList.add("highScoreHighlight");
    }
}

function showModal(message) {
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modalText");
    modalMessage.textContent = message;
    modal.style.display = "block";
}

function handleKeyPress(event, board, numRows, numCols, gameBoard) {
    event.preventDefault();
    switch (event.key) {
        case "ArrowUp":
            moveFocus(numRows, numCols, gameBoard, -1, 0);
            break;
        case "ArrowDown":
            moveFocus(numRows, numCols, gameBoard, 1, 0);
            break;
        case "ArrowLeft":
            moveFocus(numRows, numCols, gameBoard, 0, -1);
            break;
        case "ArrowRight":
            moveFocus(numRows, numCols, gameBoard, 0, 1);
            break;
        case "f":
            if (!gameBoard.classList.contains("blocked")) {
                flagFocusedCell(board, numRows, numCols, gameBoard);
            }
            break;
        case "s":
            if (!gameBoard.classList.contains("blocked")) {
                revealCell(board, numRows, numCols, gameBoard, oldRow, oldCol);
            } 
    }
}

function moveFocus(numRows, numCols, gameBoard, deltaRow, deltaCol) {
    const newRow = oldRow + deltaRow;
    const newCol = oldCol + deltaCol;

    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        const newCell = gameBoard.querySelector(`.cell[data-row='${newRow}'][data-col='${newCol}']`);

        if (newCell) {
            newCell.setAttribute("tabindex", "0");
            newCell.focus();
        }
        oldRow = newRow;
        oldCol = newCol;
    }
}

function flagFocusedCell(board, numRows, numCols, gameBoard) {
    toggleFlag(board, numRows, numCols, gameBoard, oldRow, oldCol, { preventDefault: () => {} });
}


document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && document.getElementById("modal").style.display === "block") {
        document.getElementById("modal").style.display = "none";
    }
});

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault(); 
        handleTabPress();
    }
});

function handleTabPress() {
    
    const boards = document.querySelectorAll(".board");
    if (boards.length === 0) return;

    
    let focusedBoard = document.activeElement;
    let currentBoardIndex = Array.from(boards).indexOf(focusedBoard);

    
    let nextBoardIndex = (currentBoardIndex + 1) % boards.length;

    
    if (focusedBoard) {
        focusedBoard.blur();
    }

    
    boards[nextBoardIndex].focus();
}

function handleEnterKeyPress(board, event, numRows, numCols, gameBoard) {
    event.preventDefault(); 
    moveFocus(numRows, numCols, gameBoard, 0, 0);
}

function revealAllMines(board, numRows, numCols) {
    
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (board[i][j].isMine) {
                board[i][j].revealed = true;
            }
        }
    } 
}



