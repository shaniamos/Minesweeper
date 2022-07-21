const NORMAL = '😊'
const DEAD = '😒'
const WIN = '😎'

const MINE = '💣'
const MINE_BOMB = '💥'
const FLAG = '🚩'

const USED_HINT = '❔'

var gBoard //The model: A Matrix containing cell objects
var gLevel //This is an object by which the board size is set
var gGame
var isFirstClick
var gTimer
var gameInterval
var mineInterval
var gLives
var cellClickedForHint

function initGame(size = 4) {
    //Model
    clearInterval(gameInterval)
    isFirstClick = true
    cellClickedForHint = false
    gTimer = 0
    gLevel = {
        SIZE: size,
        MINES: getMinesCount(size),
        HINTS: 3
    }
    gGame = {
        isOn: true, // When true we let the user play
        shownCount: 0, // How many cells are shown
        markedCount: 0, // How many cells are marked (with a flag)
        secsPassed: 0, // How many seconds passed 
        hints: createHints()
    }
    gBoard = createBoard()//Empty board

    //DOM
    renderBoard(gBoard) //Empty board with empty cells
    renderMinesCount()
    renderEmoji(NORMAL)
    renderTimer()
    initLives()
    // initHints()
}

function createBoard() {
    const board = []
    const boardSize = gLevel.SIZE

    for (var i = 0; i < boardSize; i++) {
        var line = []
        for (var j = 0; j < boardSize; j++) {
            line.push(createCell())
        }
        board.push(line)
    }
    return board
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (isFirstClick) initFirstClick(i, j)

    if (cellClickedForHint) {
        console.log('cellClicked: celClickedForHint:', cellClickedForHint)
        giveHint(i, j, elCell)
        cellClickedForHint = false
        return
    }

    const currCell = gBoard[i][j]
    if (currCell.isMarked) return

    if (!currCell.isShown && !currCell.isMine) {
        updateShownCounter(currCell)
        renderCell({ i, j }, currCell.minesAroundCount)
        if (currCell.minesAroundCount === 0) {
            expandShown(i, j)
            renderBoard(gBoard)
        }
        checkGameOver()
    }

    if (currCell.isMine) mineClicked(currCell, elCell, i, j)
}

function hintClicked(elHint, hintNum) {
    if (isFirstClick) return
    const currHint = gGame.hints[hintNum - 1]
    if (!currHint.isGiven) {
        cellClickedForHint = true
        currHint.isGiven = true
        renderHint(hintNum)
    }
    console.log('hint number', hintNum)
}

function giveHint(i, j, elCell) {
    console.log('giveHint FUNC')
    showNeighborsForHint(i, j)
    setTimeout(hideAfterHint, 1000, i, j)
}


function initFirstClick(i, j) {
    gameInterval = setInterval(updateTimer, 1000)
    isFirstClick = false
    updateShownCounter(gBoard[i][j])
    showNeighbors(i, j)
    buildBoard()
    renderBoard(gBoard)
    expandShown(i, j)
    renderBoard(gBoard)
    console.log('gGame.shownCount after first click:', gGame.shownCount)
}

function initLives() {
    //Beginner -  2 MINES 1 LIVE
    //Medium   - 12 MINES 3 LIVES
    //Expert   - 30 MINES 3 LIVES
    gLives = getLivesCount()
    var elLives = document.querySelector('.lives');
    var strHTML = 'lives:'
    for (var i = 1; i <= gLives; i++) {
        strHTML += `<span class="live-${i}">🙉</span>`
    }
    elLives.innerHTML = strHTML
}

function buildBoard() {

    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyCell = getEmptyCell(gBoard)
        gBoard[emptyCell.i][emptyCell.j].isMine = true
    }
    setMinesNegsCount(gBoard)
    printBoard(gBoard)
}


function printBoard(board) {
    console.log('print board:')
    var newBoard = []
    for (var i = 0; i < board.length; i++) {
        var newLine = []
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                newLine.push(MINE)
            } else {
                newLine.push(board[i][j].minesAroundCount)
            }
        }
        newBoard.push(newLine)
    }
    console.table(newBoard)
}

function createCell() {
    const cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isRendNeigh: false,
        isShownForHint: false,
    }
    return cell
}

function createHints() {
    const hints = []
    for (var i = 1; i <= gLevel.HINTS; i++) {
        hints.push(createHint(i))
    }
    console.log('CreateHints: ', hints)
    return hints
}

function createHint(hintNum) {
    const hint = {
        hintNum: hintNum,
        isGiven: false
    }
    return hint
}

function mineClicked(currCell, elCell, i, j) {
    currCell.isShown = true
    gLives--

    var elLive = document.querySelector(`.live-${gLives + 1}`)
    elCell.innerText = MINE_BOMB
    setTimeout(renderCell, 500, { i, j }, MINE)
    elLive.style.display = 'none'
    if (gLives < 1) failed()

}

function setMinesNegsCount(board) {
    //Count mines around each cell and set the cell's minesAroundCount.
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
}

function cellMarked(event, elCell, i, j) {
    //Called on right click to mark a cell (suspected to be a mine) 
    if (isFirstClick) return

    var currCell = gBoard[i][j]
    if (event.button !== 2 || currCell.isShown) return

    //Update model
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
    } else {
        if (gLevel.MINES == gGame.markedCount) return
        currCell.isMarked = true
        gGame.markedCount++
    }
    //Update DOM
    var value = (currCell.isMarked) ? FLAG : ''
    renderMinesCount()
    renderCell({ i, j }, value)
    checkGameOver()
}

function expandShown(cellI, cellJ) {
    updateShownCounter(gBoard[cellI, cellJ])
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            updateShownCounter(gBoard[i][j])
            if (gBoard[i][j].minesAroundCount === 0) {
                if (!gBoard[i][j].isRendNeigh) {
                    gBoard[i][j].isRendNeigh = true
                    expandShown(i, j)
                }
            }
        }
    }
}

function updateShownCounter(currCell) {
    if (!currCell.isShown) {
        currCell.isShown = true
        gGame.shownCount++
        console.log('Shown Added! currCounter:', gGame.shownCount)
    }
}

function failed() {
    renderAllMines()
    gGame.isOn = false
    clearInterval(gameInterval)
    renderEmoji(DEAD)
}

function checkGameOver() {
    //Game ends when all mines are marked, and all the other cells are shown
    gGame.markedCount = 0 
    gGame.shownCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine && currCell.isMarked){
                gGame.markedCount++
            }else if(!currCell.isMine && currCell.isShown){
                gGame.shownCount++
            }
        }        
    }

    var exeptedShownCount = (gLevel.SIZE) * (gLevel.SIZE) - gLevel.MINES
    console.log('ExpectedShownCount:', exeptedShownCount, 'ActualShownCount:', gGame.shownCount)
    console.log('ExpectedMarkedCount:', gLevel.MINES, 'ActualMarkedCount:', gGame.markedCount)
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === exeptedShownCount) {
        gGame.isOn = false
        clearInterval(gameInterval)
        renderEmoji(WIN)

        console.log('WELL DONE! GOOD JOB')
    }
}

function getMinesCount(boardSize) {
    switch (boardSize) {
        case 4:
            return 2
            break;
        case 8:
            return 12
            break;
        case 12:
            return 30
            break;
    }
    console.log('invalid board size')
    return 0
}

function getLivesCount() {
    switch (gLevel.SIZE) {
        case 4:
            return 1
            break;
        case 8:
            return 3
            break;
        case 12:
            return 3
            break;
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = `cell-${location.i}-${location.j}`;
    return cellClass;
}

function updateTimer() {
    gTimer++
    renderTimer()
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })
            cellClass += (currCell.isMine) ? ' mine' : ` around-count${currCell.minesAroundCount}`
            cellClass += (currCell.isShown) ? ' shown' : ''
            cellClass += (currCell.isMarked) ? ' marked' : ''
            strHTML += `\t<td   class="cell ${cellClass}"  
                                onclick="cellClicked(this , ${i} , ${j})" 
                                onmousedown="cellMarked(event, this,  ${i} , ${j} )">\n`;


            strHTML += (currCell.isMarked) ? FLAG : ''
            if (currCell.isShown) {
                if (currCell.isMine) {
                    strHTML += MINE
                } else {
                    strHTML += currCell.minesAroundCount
                }
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderCell(location, value) {
    // Select the elCell and set the value
    // const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    if (value !== FLAG && value !== '') elCell.classList.add("shown")

    elCell.innerHTML = value;
}

function renderHintedCell(location) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.classList.remove("shown")
    elCell.innerHTML = '';
}

function renderAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) renderCell({ i, j }, MINE)
        }
    }
}

function renderTimer() {
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = zeroPad(gTimer, 3)
}

function renderMinesCount() {
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    var elMinesCount = document.querySelector('.marked-count')
    elMinesCount.innerHTML = zeroPad(gLevel.MINES - gGame.markedCount, 3)
}

function renderEmoji(emoji) {
    var elEmoji = document.querySelector('.game-emoji')
    elEmoji.innerHTML = emoji
}

function renderHint(hintNum) {
    var elHint = document.querySelector(`.hint-${hintNum}`)
    elHint.innerHTML = USED_HINT
}

