// Global variables to control the behavior of the game 
var DEBUG = false;
var withAI = true;

//Uploading Tesla pieces images 
const imgs = [null, new Image(), new Image(), new Image(), new Image()];
imgs[1].src = 'redpiece.png';
imgs[2].src = 'blackpiece.png';
imgs[3].src = 'redqueen.png';
imgs[4].src = 'blackqueen.png';

const PLAYER = {P1: 1, P2: 2};

// Identify diifferent piece types or 0 if no pieces
const PIECE_TYPE = {
    NO_PIECE: 0,
    RED_PIECE: 1,
    BLACK_PIECE: 2,
    SUPER_RED: 3,
    SUPER_BLACK: 4
};

// Squares identification on the checkers board
const SQR = {
    A1:7, A2:13, A3:19, A4:25, A5:31, A6:37, A7:43, A8:49,
    B1:8, B2:14, B3:20, B4:26, B5:32, B6:38, B7:44, B8:50,
    C1:9, C2:15, C3:21, C4:27, C5:33, C6:39, C7:45, C8:51,
    D1:10, D2:16, D3:22, D4:28, D5:34, D6:40, D7:46, D8:52,
    NONE: 0
};

const FILE = {
    FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_NONE: 4
};

const RANK = {
    RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3,
    RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7,
    RANK_NONE: 9
};

// Squares that are not considered valid to be coccupied 
const OFF_BOARD = [
    0,1,2,3,4,5,
    6,12,18,24,30,36,42,48,54,
    11,17,23,29,35,41,47,53,59,
    55,56,57,58
];

const EVEN_RANK_SQR = [
    SQR.A2, SQR.B2, SQR.C2, SQR.D2, SQR.A4, SQR.B4, SQR.C4, SQR.D4,
    SQR.A6, SQR.B6, SQR.C6, SQR.D6, SQR.A8, SQR.B8, SQR.C8, SQR.D8
];

const ODD_RANK_SQR = [
    SQR.A1, SQR.B1, SQR.C1, SQR.D1, SQR.A3, SQR.B3, SQR.C3, SQR.D3,
    SQR.A5, SQR.B5, SQR.C5, SQR.D5, SQR.A7, SQR.B7, SQR.C7, SQR.D7
];

const SIDE_SQR = [SQR.A2, SQR.A4, SQR.A6, SQR.A8, SQR.D1, SQR.D3, SQR.D5, SQR.D7];

const BOARD_SIZE = 60;
const BOARD_DEF = {};

const sqr48 = [];

BOARD_DEF.board = new Array(BOARD_SIZE);
BOARD_DEF.move = PLAYER.P2;
BOARD_DEF.availableMoves = null;

BOARD_DEF.rPieces = [
    SQR.A1, SQR.B1, SQR.C1, SQR.D1,
    SQR.A2, SQR.B2, SQR.C2, SQR.D2,
    SQR.A3, SQR.B3, SQR.C3, SQR.D3
];

BOARD_DEF.bPieces = [
    SQR.A8, SQR.B8, SQR.C8, SQR.D8,
    SQR.A7, SQR.B7, SQR.C7, SQR.D7,
    SQR.A6, SQR.B6, SQR.C6, SQR.D6
];

const MOVE_TYPE = {
    MOVE_NORMAL : 0,
    MOVE_CAPTURE : 1
};

// Creating queen on both ends of the boards, these case have the ability to change our piece into queens
const SUPER_SQR = [[SQR.A8, SQR.B8, SQR.C8, SQR.D8], [SQR.A1, SQR.B1, SQR.C1, SQR.D1]];

function frToSqr(f, r){
    return (7 + f) + (r * 6);
}

// Function to initialize the board with the current state of the pieces 
function initBoard(bf){
    for(let i=0; i<BOARD_SIZE; i++){
        bf.board[i] = PIECE_TYPE.NO_PIECE;
    }

    for(let r=RANK.RANK_1; r<Object.keys(RANK).length-1; r++){
        for(let f=FILE.FILE_A; f<Object.keys(FILE).length-1; f++){
            sqr48.push(frToSqr(f, r));
        }
    }

    Object.keys(SQR).forEach(function(key) {
        if(hasPieceAt(bf.rPieces, SQR[key])){
            bf.board[SQR[key]] = PIECE_TYPE.RED_PIECE;

        }
        if(hasPieceAt(bf.bPieces, SQR[key])){
            bf.board[SQR[key]] = PIECE_TYPE.BLACK_PIECE;
        }
    });

    bf.availableMoves = generateMove(bf.move, bf);
}

/*
Function responsible for moving pieces. 
src: the source square (a number representing the square)
target: the target square (a number representing the square)
bf: the board state (an object containing information about the pieces on the board and their positions)
Return true if move is valid and false if invalid. 
*/
function movePiece(src, target, bf){
    if(bf.board[src] != PIECE_TYPE.NO_PIECE && bf.board[target] == PIECE_TYPE.NO_PIECE){
        for(let m of bf.availableMoves){
            if(m.piece == src && m.moves.includes(target)){
                insertPiece(src, target, bf);
                switchPlayer(bf);
                return [true, MOVE_TYPE.MOVE_NORMAL];
            }else if(m.piece == src && m.captures.length > 0){
                for(let capture of m.captures){
                    if(target == capture.to){
                        removePiece(capture.remove, bf);
                        insertPiece(src, target, bf);

                        if(!hasMultipleCapture(target, bf)){
                            switchPlayer(bf);
                        }

                        return [true, MOVE_TYPE.MOVE_CAPTURE, capture.remove];
                    }
                }
            }
        }
    }
    return [false];
}
//Removing pieces through squares and bf: (currentstate)
function removePiece(sqr, bf){
    if(bf.board[sqr] == PLAYER.P1){
        bf.rPieces.splice(bf.rPieces.indexOf(sqr), 1);
    }else if(bf.board[sqr] == PLAYER.P2){
        bf.bPieces.splice(bf.bPieces.indexOf(sqr), 1);
    }else if(PIECE_TYPE.SUPER_RED == bf.board[sqr]){
        bf.rPieces.splice(bf.rPieces.indexOf(sqr), 1);
    }else if(PIECE_TYPE.SUPER_BLACK == bf.board[sqr]){
        bf.bPieces.splice(bf.bPieces.indexOf(sqr), 1);
    }

    bf.board[sqr] = PIECE_TYPE.NO_PIECE;
}

function insertPiece(src, target, bf){
    bf.board[target] = bf.board[src];
    bf.board[src] = PIECE_TYPE.NO_PIECE;
    if(PIECE_TYPE.RED_PIECE == bf.board[target]){
        bf.rPieces[bf.rPieces.indexOf(src)] = target;
    }else if(PIECE_TYPE.BLACK_PIECE == bf.board[target]){
        bf.bPieces[bf.bPieces.indexOf(src)] = target;
    }else if(PIECE_TYPE.SUPER_RED == bf.board[target]){
        bf.rPieces[bf.rPieces.indexOf(src)] = target;
    }else if(PIECE_TYPE.SUPER_BLACK == bf.board[target]){
        bf.bPieces[bf.bPieces.indexOf(src)] = target;
    }
}

function upgradePiece(bf){
    for(let i=0; i<bf.rPieces.length; i++){
        if(SUPER_SQR[0].includes(bf.rPieces[i])){
            bf.board[bf.rPieces[i]] = PIECE_TYPE.SUPER_RED;
        }
    }

    for(let i=0; i<bf.bPieces.length; i++){
        if(SUPER_SQR[1].includes(bf.bPieces[i])){
            bf.board[bf.bPieces[i]] = PIECE_TYPE.SUPER_BLACK;
        }
    }
}

function switchPlayer(bf){

    upgradePiece(bf);

    bf.move = bf.move == PLAYER.P1 ? PLAYER.P2 : PLAYER.P1;
    bf.availableMoves = generateMove(bf.move, bf);
}

function hasMultipleCapture(target, bf){

    let moves = generateMove(bf.move, bf);

    for(let move of moves){
        if(move.captures.length > 0 && move.piece == target){
            bf.availableMoves = moves.filter(pp => pp.piece == target);
            return true;
        }
    }

    return false;
}


function generateMove(player, bf){
    let possibleMoves = [];
    let pieceCount = 0;
    let pieces = [];

    if(player == PLAYER.P1){
        pieceCount = bf.rPieces.length;
        pieces = bf.rPieces;
    }else if(player == PLAYER.P2){
        pieceCount = bf.bPieces.length;
        pieces = bf.bPieces;
    }

    let hasCaptureMove = false;
    let superCap = false;

    for(let i=0; i<pieceCount; i++){
        let moves = moveCount(player, pieces[i]);
        let m = {piece: pieces[i], moves: [], captures: []};

        let move1 = pieces[i] + moves[0];
        let move2 = pieces[i] + moves[1];
        let move3 = pieces[i] + moves[2];
        let move4 = pieces[i] + moves[3];

        if (bf.board[pieces[i]] == PIECE_TYPE.SUPER_BLACK || bf.board[pieces[i]] == PIECE_TYPE.SUPER_RED)
        {
            superCap = superPieceCapture(m, pieces[i], bf) ? true : superCap;
            hasCaptureMove = hasCaptureMove ? true : superCap;
        }

        hasCaptureMove = checkCaptureMoves(m, move1, player, 0, bf) ? true : hasCaptureMove;
        hasCaptureMove = checkCaptureMoves(m, move2, player, 1, bf) ? true : hasCaptureMove;
        hasCaptureMove = checkCaptureMoves(m, move3, player, 2, bf) ? true : hasCaptureMove;
        hasCaptureMove = checkCaptureMoves(m, move4, player, 3, bf) ? true : hasCaptureMove;

        if(m.captures.length > 0)
            possibleMoves.push(m)
    }

    if(!hasCaptureMove){
        for(let i=0; i<pieceCount; i++){
            let moves = moveCount(player, pieces[i]);
            let m = {piece: pieces[i], moves: [], captures: []};
            let move1 = pieces[i] + moves[0];
            let move2 = pieces[i] + moves[1];

            if(bf.board[pieces[i]] == PIECE_TYPE.SUPER_RED || bf.board[pieces[i]] == PIECE_TYPE.SUPER_BLACK){
                superPieceMove(m, pieces[i], bf);
                if(m.moves.length > 0) possibleMoves.push(m);
                continue;
            }

            if(bf.board[move1] == PIECE_TYPE.NO_PIECE && !inOffset(move1)){
                m.moves.push(pieces[i] + moves[0]);
            }
            if(bf.board[move2] == PIECE_TYPE.NO_PIECE && !inOffset(move2)){
                m.moves.push(pieces[i] + moves[1]);
            }

            if(m.moves.length > 0) possibleMoves.push(m);
        }
    }
    return possibleMoves;
}

function superPieceCapture(piece, sqr, bf){
    let mUpRight = sqr + sqrPieceEvenOrOdd(sqr)[0];
    let mUpLeft = sqr + sqrPieceEvenOrOdd(sqr)[1];
    let mDownLeft= sqr +  sqrPieceEvenOrOdd(sqr)[2];
    let mDownRight = sqr +  sqrPieceEvenOrOdd(sqr)[3];

    let hasCap = false;
    hasCap = sPieceCap(mUpRight, 0, piece, bf) ? true : hasCap;
    hasCap = sPieceCap(mUpLeft, 1, piece, bf) ? true : hasCap;
    hasCap = sPieceCap(mDownLeft, 2, piece, bf) ? true : hasCap;
    hasCap = sPieceCap(mDownRight, 3, piece, bf) ? true : hasCap;

    return hasCap;
}

function sPieceCap(direct, i, piece, bf){
    let hasCap = false;
    while(!inOffset(direct)){
        if(bf.board[direct] != PIECE_TYPE.NO_PIECE){
            let sPieceType = bf.move == PLAYER.P1 ? PIECE_TYPE.SUPER_RED : PIECE_TYPE.SUPER_BLACK;

            if(bf.board[direct] == bf.move || bf.board[direct] == sPieceType) break;

            let toRemove = direct;

            direct += sqrPieceEvenOrOdd(direct)[i];
            if(bf.board[direct] == PIECE_TYPE.NO_PIECE && !inOffset(direct)){
                piece.captures.push({to: direct, remove: toRemove});
                hasCap = true;
            }

            break;

        }
        direct += sqrPieceEvenOrOdd(direct)[i];
    }

    return hasCap;
}

function superPieceMove(piece, sqr, bf){

    let mUpRight = sqr + sqrPieceEvenOrOdd(sqr)[0];
    let mUpLeft = sqr + sqrPieceEvenOrOdd(sqr)[1];
    let mDownLeft= sqr +  sqrPieceEvenOrOdd(sqr)[2];
    let mDownRight = sqr +  sqrPieceEvenOrOdd(sqr)[3];

    while(bf.board[mUpRight] == PIECE_TYPE.NO_PIECE && !inOffset(mUpRight)){
        piece.moves.push(mUpRight);
        mUpRight += sqrPieceEvenOrOdd(mUpRight)[0];
    }

    while(bf.board[mUpLeft] == PIECE_TYPE.NO_PIECE && !inOffset(mUpLeft)){
        piece.moves.push(mUpLeft);
        mUpLeft += sqrPieceEvenOrOdd(mUpLeft)[1];
    }

    while(bf.board[mDownLeft] == PIECE_TYPE.NO_PIECE && !inOffset(mDownLeft)){
        piece.moves.push(mDownLeft);
        mDownLeft += sqrPieceEvenOrOdd(mDownLeft)[2];
    }

    while(bf.board[mDownRight] == PIECE_TYPE.NO_PIECE && !inOffset(mDownRight)){
        piece.moves.push(mDownRight);
        mDownRight += sqrPieceEvenOrOdd(mDownRight)[3];
    }

}

function sqrPieceEvenOrOdd(sqr){
    if(EVEN_RANK_SQR.includes(sqr))
        return [-6, -7, 5, 6];

    return[-5, -6, 6, 7];
}

function checkCaptureMoves(m, move, player, tmove, bf){
    if(bf.board[move] != PIECE_TYPE.NO_PIECE && player != bf.board[move] && !inOffset(move)){
        let moveTemp = moveCount(player, move);

        let sPieceType = player == PLAYER.P1 ? PIECE_TYPE.SUPER_RED : PIECE_TYPE.SUPER_BLACK;

        if(bf.board[move] == sPieceType)
            return false;

        if(bf.board[move + moveTemp[tmove]] == PIECE_TYPE.NO_PIECE  && !inOffset(move + moveTemp[tmove])){
            m.captures.push({to: move + moveTemp[tmove], remove: move});
            return true;
        }
    }
    return false;
}

function moveCount(player, sqr){
    if(player == PLAYER.P1){
        if(EVEN_RANK_SQR.includes(sqr)){
            return [5, 6, -6, -7];
        }else if(ODD_RANK_SQR.includes(sqr)){
            return [6, 7, -5, -6];
        }
    }
    else if(player == PLAYER.P2)
    {
        if(EVEN_RANK_SQR.includes(sqr)){
            return [-6, -7, 5, 6];
        }else if(ODD_RANK_SQR.includes(sqr)){
            return [-5, -6, 6, 7];
        }
    }
    return [0,0];
}

function inOffset(pos){
    return OFF_BOARD.includes(pos);
}

function hasPieceAt(pos, index){
    return pos.includes(index);
}

function printBoard(){
    let s = "";
    s += "<center>";
    let x = 0;
    let y = false;
   for(let i=0; i<sqr48.length*2; i++){
        if(i % 8 == 0)
        {
            s += "<br>";
            y = !y;
        }
        if(i % 2 == 0){
            if(y) s += "--";
            s += ""+BOARD_DEF.board[sqr48[x]];
            if(!y) s += "--";
            x++;
        }
    }
   s += "</center>";
   return s;
}

