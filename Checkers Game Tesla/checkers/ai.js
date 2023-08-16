var AI = PLAYER.P1;

let AI_LVL = 3;
/* Function for moves of the AI
Checks if no move available for the AI or if it is AI Turn
bf represents the current state of the board */
function aiMove(bf){

    if(bf.availableMoves.length == 0 || bf.move != AI)return;

    let bb = tempBfClone(bf);

    let depth = AI_LVL * 2;
    let move = minmax(bb, depth, -Infinity, Infinity, AI)[0];

    let verdict;
    if(move.capture){
        verdict = movePiece(move.src, move.target.to, bf);
    }else{
        verdict = movePiece(move.src, move.target, bf);
    }

    let mpiece = null;
    let index = null;
    for(let i=0; i<tiles.length; i++){
        if(tiles[i].sqr == move.src){
            mpiece = tiles[i];
        }

        if(move.capture){
            if(tiles[i].sqr == move.target.to) index = i;
        }else{
            if(tiles[i].sqr == move.target) index = i;
        }
    }

    updatePiecesPos(mpiece, verdict, index, bf);

}

/*
Function implementing a minmax algorithm 
bf: represents the current state of the board.
depth: represents the search depth of the algorithm.
alpha: represents the maximum possible value.
beta: represents the minimum possible value.
turn: represents the player that is currently making a move.

If it's the turn of the AI (maximizing player), the function sets
the best score to negative infinity and the best move to null.

If it's the turn of the opponent (minimizing player), the process
is similar except that the function sets the best score
to positive infinity and the best move to null.
*/
function minmax(bf, depth, alpha, beta, turn){

    if (depth <= 0 || bf.availableMoves <= 0) return evaluatePosition(bf);
    if(turn == AI){

        let bestScore = -Infinity;
        let bestMove = null;

        let tempBf = tempBfClone(bf);
        for(let pieceMove of tempBf.availableMoves){
            let moves;
            let isCapture = false;

            if(pieceMove.moves.length > 0){
                moves = pieceMove.moves;
            }else{
                moves = pieceMove.captures;
                isCapture = true;
            }

            for(let move of moves){

                createNewNode(tempBf, pieceMove.piece, move, isCapture);
                let value = minmax(tempBf, depth-1, alpha, beta, tempBf.move)[1];

                if (value > bestScore){
                    bestScore = value;
                    bestMove = {src: pieceMove.piece, target: move, capture: isCapture};
                }
                alpha = Math.max(alpha, value);

                tempBf = tempBfClone(bf);

                if(alpha >= beta) break;
            }
            if(alpha >= beta) break;
        }
        return [bestMove, bestScore];

    }else{
        let bestScore = Infinity;
        let bestMove = null;

        let tempBf = tempBfClone(bf);

        for(let pieceMove of tempBf.availableMoves){
            let moves;
            let isCapture = false;

            if(pieceMove.moves.length > 0){
                moves = pieceMove.moves;
            }else{
                moves = pieceMove.captures;
                isCapture = true;
            }

            for(let move of moves){

                createNewNode(tempBf, pieceMove.piece, move, isCapture);
                let value = minmax(tempBf, depth-1, alpha, beta, tempBf.move)[1];

                if (value < bestScore){
                    bestScore = value;
                    bestMove = {src: pieceMove.piece, target: move, capture: isCapture};
                }
                beta = Math.min(beta, value);

                tempBf = tempBfClone(bf);

                if(alpha >= beta) break;
            }
            if(alpha >= beta) break;
        }
        return [bestMove, bestScore];

     }
}
// Creates new board states by making moves on the current board state "bf"
function createNewNode(bf, src, target, isCapture){
    if(isCapture){
        movePiece(src, target.to, bf);
    }else{
        movePiece(src, target, bf);
    }
}

// Helper function to evaluate the current state of the board and determine which player is ahead 
function evaluatePosition(bf){

    let rPieceSum = 0;
    let bPieceSum = 0;

    for(let p of bf.rPieces){
        if(bf.board[p] == PIECE_TYPE.SUPER_RED){
            rPieceSum += 3;
        }else if(bf.board[p] == PLAYER.P1){
            rPieceSum++;
        }
    }

    for(let p of bf.bPieces){
        if(bf.board[p] == PIECE_TYPE.SUPER_BLACK){
            bPieceSum += 3;
        }else if(bf.board[p] == PLAYER.P2){
            bPieceSum++;
        }
    }

    let eval =  rPieceSum - bPieceSum;
    return [null, eval];
}

// Deep copy of the current board state "bf" to prevent changes made during the AI turn
function tempBfClone(bf){
    let retBoard = {};
    retBoard.board = new Array(BOARD_SIZE);
    retBoard.bPieces = [];
    retBoard.rPieces = [];
    retBoard.availableMoves = [];
    retBoard.move = bf.move;

    for(let i=0; i<BOARD_SIZE; i++){
        retBoard.board[i] = bf.board[i];
    }

    for(let i=0; i<bf.rPieces.length; i++){
        retBoard.rPieces[i] = bf.rPieces[i];
    }

    for(let i=0; i<bf.bPieces.length; i++){
        retBoard.bPieces[i] = bf.bPieces[i];
    }

    for(let i=0; i<bf.availableMoves.length; i++){
        retBoard.availableMoves[i] = bf.availableMoves[i];
    }

    return retBoard;
}