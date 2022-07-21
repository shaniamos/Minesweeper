var gNums
function getEmptyCell(board) {
    const emptyCells = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine && !gBoard[i][j].isShown) emptyCells.push({ i, j })
        }
    }
    const randIdx = getRandomInt(0, emptyCells.length - 1)
    return emptyCells[randIdx]
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
    //The maximum is inclusive and the minimum is inclusive
}

function countNeighbors(cellI, cellJ, board) {
    var neighborsCount = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function showNeighbors(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            updateShownCounter(gBoard[i][j])
            //renderCell({ i, j }, gBoard[i][j].minesAroundCount)
        }
    }
}

function showNeighborsForHint(cellI, cellJ) {
    console.log('gGame.shownCount:', gGame.shownCount)
    if (!gBoard[cellI][cellJ].isShown) {
        gBoard[cellI][cellJ].isShown = true
        gBoard[cellI][cellJ].isShownForHint = true
    }
    if (gBoard[cellI][cellJ].isMine) {
        renderCell({ i: cellI,j: cellJ }, MINE)
    }else{
    renderCell({ i: cellI,j: cellJ }, gBoard[cellI][cellJ].minesAroundCount)
    }

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                gBoard[i][j].isShownForHint = true
            }
            if (gBoard[i][j].isMine) {
                renderCell({ i, j }, MINE)
            }else{
            renderCell({ i, j }, gBoard[i][j].minesAroundCount)
            }
        }
    }
}

function hideAfterHint(cellI, cellJ) {
    console.log('hideAfterHint')
    if (gBoard[cellI][cellJ].isShownForHint) {
        gBoard[cellI][cellJ].isShownForHint = false
        gBoard[cellI][cellJ].isShown = false
        renderHintedCell({ i: cellI , j: cellJ })
    }
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShownForHint) {
                gBoard[i][j].isShownForHint = false
                gBoard[i][j].isShown = false
                renderHintedCell({ i, j })
            }
        }
    }
    console.log('gGame.shownCount:', gGame.shownCount)
}

