
////globals
// gBoard – Matrix contains cell objects:-----the model
var gBoard = [];
const BOOM = '💣';
const FLAG = '🚩';
const DEAD = '😭';
const ALIVE = '😃';
var gclicksCount = 0;
var gintervalOn;
var gisOver = false;
var gsize = 4;
var gnumberOfMines = 2;
var gflagsCounter = 0;

function startTimer() {

    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var totalSeconds = 0;
    gintervalOn = setInterval(setTime, 1000);

    function setTime() {
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }

    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
}

// This is an object by which the board size is set (in this case:
// 4*4), and how many mines to put
var gLevel = { SIZE: 4, MINES: 2 };
// This is an object in which you can keep and update the current game state: 
// isOn – boolean, when true we let the user play shownCount: how many cells are shown markedCount: 
// how many cells are marked (with a flag) secsPassed: how many seconds passed
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// This is called when page loads
function initGame() {
    gflagsCounter = 0;
    gclicksCount = 0;
    gisOver = false;
    var smille = document.querySelector('.smille');
    smille.innerText = ALIVE;
    var gameOverTxt = document.querySelector('.is-victory');
    gameOverTxt.innerText = '';
    gBoard = buildBoard();
    renderBoard(gBoard, '.board-container');
}

// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = [];
    for (var i = 0; i < gsize; i++) {
        board[i] = [];
        for (var j = 0; j < gsize; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                i: i,
                j: j,
                neighbors: []
            };
        }
    }
    for (var m = 0; m < gnumberOfMines; m++) {
        var boom = board[getRandomInt(0, gsize)][getRandomInt(0, gsize)];
        console.log('boom is in: ', boom);
        boom.isMine = true;
    }

    setMinesNegsCount(board);
    return board;

}
// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {

    for (var idx = 0; idx < board.length; idx++) {
        var rowOfMat = board[idx];
        for (var idy = 0; idy < board[0].length; idy++) {
            var cell = rowOfMat[idy];
            var col = cell.i;
            var row = cell.j;

            for (var i = row - 1; i <= row + 1; i++) {
                if (i < 0 || i >= board.length) continue;
                for (var j = col - 1; j <= col + 1; j++) {
                    if (j < 0 || j >= board.length) continue;
                    if (i === row && j === col) continue;/////so he will not count himself
                    var cellItSelf = board[i][j];
                    if (cellItSelf.isMine === true) {
                        board[row][col].minesAroundCount++;
                    }
                    var neighbor = board[i][j];
                    board[row][col].neighbors.push(neighbor);
                }
            }
        }
    }
}
// Render the board as a <table> to the page
function renderBoard(board, selector) {


    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var row = board[i][j].i;
            var col = board[i][j].j;
            var cell = board[i][j].minesAroundCount;
            var className = 'hide cell' + row + '-' + col;
            strHTML += `<td onmousedown="cellClicked(this,${gBoard[i][j].i},${gBoard[i][j].j})" 
        class="${className}">${cell}</td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gisOver) return;
    gclicksCount++;

    if (gclicksCount === 1) {
        if (gBoard[i][j].isMine) {
            gclicksCount--;
            return;
        }
        startTimer();
    }
    if (event.button == 2) {
        var elMarked = cellMarked(elCell);
        if (elMarked.classList.contains('hide')) {
            elMarked.classList.remove('hide');
            elMarked.innerText = FLAG;
            gflagsCounter++;
            checkGameOver();
        } else {
            elMarked.classList.add('hide');
            gBoard[i][j].isMarked = false;
            gflagsCounter--;
            elMarked.innerText = gBoard[i][j].minesAroundCount;
            checkGameOver();
        }
    }

    // Left click clicked
    else if (event.button == 0) {
        if (gBoard[i][j].isMarked) return;

        gBoard[i][j].isShown = true;
        elCell.classList.remove('hide');

        if (gBoard[i][j].isMine) {
            elCell.innerText = BOOM;
            checkGameOver();
        } else {
            var neighborsList = gBoard[i][j].neighbors;
            for (var n = 0; n < neighborsList.length; n++) {
                if (neighborsList[n].isMine) {
                    continue;
                } else if (neighborsList[n].isMarked) {
                    continue;
                } else {
                    var neighbor = neighborsList[n];
                    neighbor.isShown = true;
                    var neighborI = neighbor.i;
                    var neighborJ = neighbor.j;
                    var elNeighbor = document.querySelector(`.cell${neighborI}-${neighborJ}`);
                    expandShown(elNeighbor, neighborI, neighborJ);
                    checkGameOver();
                }
            }
        }
    }

    else if (event.button == 1) {
        return;
    }
}

// Called on right click to mark a cell (suspected to be a mine) 
// Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell) {
    var classListEl = elCell.className
    var classNeeded = classListEl.slice(9, 14);
    var i = +classNeeded.slice(0, 1);
    var j = +classNeeded.slice(2, 3);
    gBoard[i][j].isMarked = true;

    return elCell;

}
// Game ends when all mines are marked and all the other cells are shown

function checkGameOver() {

    var gameIsOn = true;
    var flagsCounter = 0;
    var shownedCellsCounter = 0;
    var elGameOver = document.querySelector('.game-over');
    var elVictory = document.querySelector('.is-victory');
    var smille = document.querySelector('.smille');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {

            if (gBoard[i][j].isShown) {
                shownedCellsCounter++;
            } else if (gBoard[i][j].isMarked) {
                flagsCounter++;
            }
            if (gBoard[i][j].isShown && gBoard[i][j].isMine) {
                clearInterval(gintervalOn);
                gameIsOn = false;
                smille.innerText = DEAD;
                gisOver = true;
            }
        }
    }
    if (flagsCounter === gnumberOfMines && shownedCellsCounter === ((gsize * gsize) - gnumberOfMines)) {
        elVictory.innerText = 'Victory!!!';
        gameIsOn = false;
        gisOver = true;
        clearInterval(gintervalOn);
    }
    if (!gameIsOn) {
        clearInterval(gintervalOn);
        elGameOver.innerText = 'Game Over';
        gisOver = true;


    }
}


// When user clicks a cell with no mines around, we need to open not only that cell, 
// but also its neighbors. NOTE: start with a basic implementation that only opens 
// the non-mine 1st degree neighbors 
// BONUS: if you have the time later, try to work more like the real algorithm 
// (see description at the Bonuses section below)
function expandShown(elCell, row, col) {

    elCell.classList.remove('hide');
    var elCellChoosen = gBoard[row][col];
    elCell.innerText = elCellChoosen.minesAroundCount;

}


///making a random digit
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function changeTableSize(tableSize, numOfMines) {
    gsize = tableSize;
    gnumberOfMines = numOfMines;
    initGame();

}