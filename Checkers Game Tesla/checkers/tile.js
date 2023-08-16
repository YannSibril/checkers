BROWN = "rgb(154, 99, 42)";
BEIGE = "rgb(217,172,110)";

// Creating our brown and beige tiles 
class Tile{
    constructor(x, y, size, isBlack, sqr, p=null){
        this.x = x;
        this.y = y;
        this.size = size;
        this.sqr = sqr;
        this.piece = p;
        this.color = BEIGE;
        if(isBlack) this.color = BROWN;
        
    }

    draw(context){
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
        if(DEBUG){
            if(this.color == BROWN){
            context.fillStyle = "blue";
            context.font = "30px Arial";
            context.fillText(this.sqr, this.x, this.y);
            }
        }
    }

    drawPiece(context){
        if(this.piece != null){
            this.piece.draw(context);
        }
    }
}