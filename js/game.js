class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function dist(a, b) {
    return Math.sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y));
}

// returns direction of three points, or if they are collinear
function direction (a, b, c) {
    let val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (val == 0)
        return 0;   // collinear
    else if (val < 0)
        return 1;   // anti-clockwise
    else
        return -1;  // clockwise
}

class Line {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    containsPoint(p) {
        return dist(this.a, p) + dist(p, this.b) - dist(this.a, this.b) < 0.000001; // epsilon
    }

    // Modifikovan kod sa https://www.tutorialspoint.com/Check-if-two-line-segments-intersect
    // check if two lines intersect
    intersects(l) {
        let dir1 = direction(this.a, this.b, l.a);
        let dir2 = direction(this.a, this.b, l.b);
        let dir3 = direction(l.a, l.b, this.a);
        let dir4 = direction(l.a, l.b, this.b);

        if (dir1 != dir2 && dir3 != dir4)
            return true;    // does intersect

        return false; // no intersection
    }
}

class Triangle {
    constructor(a, b, c, color) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.color = color;
    }

    containsPoint(p) {
        return this.a.containsPoint(p) || this.b.containsPoint(p) || this.c.containsPoint(p);
    }

    intersects(t) {
        return this.a.intersects(t.a) || this.a.intersects(t.b) || this.a.intersects(t.c) ||
               this.b.intersects(t.a) || this.b.intersects(t.b) || this.b.intersects(t.c) ||
               this.c.intersects(t.a) || this.c.intersects(t.b) || this.c.intersects(t.c);
    }
}

/* Map setup */
var mapWidth;
var mapHeight;
var map = [];
var tileSize = 64;
var dotRadius = tileSize * 0.25;

function initMap1() {
    mapWidth = 8;
    mapHeight = 6;
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {     // represent 2D array as 1D
            map[row*mapWidth + col] = 0;    // 0 = empty tile, 1 = set tile, -1 = erased tile
        }
    }
}

function initMap2() {
    mapWidth = 6;
    mapHeight = 10;
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            map[row*mapWidth + col] = 0;
        }
    }
}

function initMap3() {
    mapWidth = 8;
    mapHeight = 8;
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            map[row*mapWidth + col] = 0;
        }
    }
}

function initMapNonStandard() {
    mapWidth = 8;
    mapHeight = 8;
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            map[row*mapWidth + col] = -1;
        }
    }

    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < row+1; col++) {
            map[row*mapWidth + col] = 0;
        }
    }
}

/* Canvas & drawing setup */
var canvas = null;
var canvasContext = null;
var drawCircle = null;
var drawLine = null;
var drawTriangle = null;

function initCanvas() {
    canvas = document.getElementById("game");
    if (canvas) {
        canvasContext = canvas.getContext("2d");

        canvas.width = tileSize * mapWidth;
        canvas.height = tileSize * mapHeight;

        drawCircle = function(x, y, r, color) {
            canvasContext.fillStyle = color;
            canvasContext.beginPath();
            canvasContext.arc(x, y, r, 0, 2 * Math.PI, 1);
            canvasContext.fill();
        };

        drawLine = function(x1, y1, x2, y2, color) {
            canvasContext.strokeStyle = color;
            canvasContext.lineWidth = 4;
            canvasContext.beginPath();
            canvasContext.moveTo(x1, y1);
            canvasContext.lineTo(x2, y2);
            canvasContext.stroke(); 
        };

        drawTriangle = function(a, b, c, color) {
            drawLine(a.x, a.y, b.x, b.y, color);
            drawLine(b.x, b.y, c.x, c.y, color);
            drawLine(c.x, c.y, a.x, a.y, color);
        }
    }
    else {
        console.error("Error: Failed to find canvas");
    }
}

function drawMap() {
    // set canvas background to black
    canvasContext.fillStyle = "black";
    canvasContext.beginPath();
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.fill();

    // draw dots
    for (let row = 0; row < mapHeight; row++) {
        for (let col = 0; col < mapWidth; col++) {
            let x = tileSize/2 + col*tileSize;
            let y = tileSize/2 + row*tileSize;

            if (map[row*mapWidth + col] == 0)
                drawCircle(x, y, dotRadius, "gray");
            else if (map[row*mapWidth + col] == 1)
                drawCircle(x, y, dotRadius, "red");
            else if (map[row*mapWidth + col] == 2)
                drawCircle(x, y, dotRadius, "rgb(139,0,0)")
        }
    }
}

var selectedTile = [];
var triangles = [];
var round = 0;
var currentPlayer = 0;
var gameOver = false;

function drawselectedTile() {
    for (let i = 0; i < selectedTile.length; i++) {
        let x = tileSize/2 + selectedTile[i].x * tileSize;
        let y = tileSize/2 + selectedTile[i].y * tileSize;

        drawCircle(x, y, dotRadius, (currentPlayer == 0) ? "red" : "rgb(139,0,0)");
    }
}

function drawTriangles() {
    for (let i = 0; i < triangles.length; i++) {
        let a = triangles[i].a.a;
        let b = triangles[i].a.b;
        let c = triangles[i].c.a;

        drawTriangle(a, b, c, triangles[i].color);
    }
}

function drawPlayerColors() {
    drawLine(0, 10, 0, canvas.height-10, currentPlayer == 0 ? "yellow" : "blue");
    drawLine(canvas.width, 10, canvas.width, canvas.height-10, currentPlayer == 0 ? "yellow" : "blue");
}

/* Main game function */
function main(input) {
    if (input == 0)
        initMap1();
    else if (input == 1)
        initMap2();
    else if (input == 2)
        initMap3();
    else if (input == 3)
        initMapNonStandard();

    initCanvas();
    
    drawMap();  // draw map for the first time
    drawPlayerColors();

    document.getElementById("info").innerHTML = (currentPlayer == 0) ? "Player A" : "Player B";

    canvas.addEventListener("click", function(event) {
        // find selected tile
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        let tileX = parseInt(x / tileSize);
        let tileY = parseInt(y / tileSize);

        if (map[tileY * mapWidth + tileX] == -1)
            return;

        selectedTile.push(new Point(tileX, tileY));
        
        // if three points are selected
        if (selectedTile.length == 3) {
            a = new Line(new Point(tileSize/2 + selectedTile[0].x*tileSize, tileSize/2 + selectedTile[0].y*tileSize), new Point(tileSize/2 + selectedTile[1].x*tileSize, tileSize/2 + selectedTile[1].y*tileSize));
            b = new Line(new Point(tileSize/2 + selectedTile[1].x*tileSize, tileSize/2 + selectedTile[1].y*tileSize), new Point(tileSize/2 + selectedTile[2].x*tileSize, tileSize/2 + selectedTile[2].y*tileSize));
            c = new Line(new Point(tileSize/2 + selectedTile[2].x*tileSize, tileSize/2 + selectedTile[2].y*tileSize), new Point(tileSize/2 + selectedTile[0].x*tileSize, tileSize/2 + selectedTile[0].y*tileSize));
            
            let newTriangle = new Triangle(a, b, c, (currentPlayer == 0) ? "yellow" : "blue");

            let validTriangle = true;

            // check for intersection
            for (let i = 0; i < triangles.length; i++) {
                if (triangles[i].intersects(newTriangle)) {
                    //console.log("Intersection");
                    validTriangle = false;
                    break;
                }
            }

            // check if new triangle is degenerate
            if (direction(newTriangle.a.a, newTriangle.a.b, newTriangle.c.a) == 0) {
                validTriangle = false;
            }
            
            // if triangle has no intersection and is not degenerate then add to list
            if (validTriangle) {
                triangles.push(newTriangle);

                // set tiles on triangle angles occupied
                for (let i = 0; i < 3; i++) {
                    map[selectedTile[i].y*mapWidth + selectedTile[i].x] = 1 + currentPlayer;
                }

                // set tiles that are covered by triangle edges occupied
                for (let row = 0; row < mapHeight; row++) {
                    for (let col = 0; col < mapWidth; col++) {
                        let x = tileSize/2 + col*tileSize;
                        let y = tileSize/2 + row*tileSize;
                        if (newTriangle.containsPoint(new Point(tileSize/2 + col*tileSize, tileSize/2 + row*tileSize))) {
                            map[row*mapWidth + col] = 1 + currentPlayer;
                        }
                    }
                }

                // set current player
                round++;
                currentPlayer = !currentPlayer;
                document.getElementById("info").innerHTML = (currentPlayer == 0) ? "Player A" : "Player B";
            }

            // deselect points
            selectedTile = [];
        }

        // check for game over
        let leftPoints = [];
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                if (map[i*mapWidth + j] == 0) {
                    leftPoints.push(new Point(tileSize/2 + tileSize*j, tileSize/2 + tileSize*i));
                }
            }
        }
        
        let gameOver = true;
        if (round == 0) {
            gameOver = false;
        }
        for (let i = 0; i < leftPoints.length-2; i++) {
            for (let j = i+1; j < leftPoints.length-1; j++) {
                for (let k = j+1; k < leftPoints.length; k++) {
                    let a = new Line(leftPoints[i], leftPoints[j]);
                    let b = new Line(leftPoints[j], leftPoints[k]);
                    let c = new Line(leftPoints[k], leftPoints[i]);
                    
                    let newTriangle = new Triangle(a, b, c);

                    let validTriangle = true;
                    // check for intersection
                    for (let i = 0; i < triangles.length; i++) {
                        if (triangles[i].intersects(newTriangle)) {
                            validTriangle = false;
                            break;
                        }
                    }

                    // check if points are collinear
                    if (direction(leftPoints[i], leftPoints[j], leftPoints[k]) == 0) {
                        validTriangle = false;
                    }

                    if (validTriangle) {
                        gameOver = false;
                        //goto(label);
                    }
                }
            }
        }

        if (gameOver) {
            document.getElementById("info").innerHTML = "<p>" + ((currentPlayer==0) ? "Player B won" : "Player A won") + "</p>";
            document.getElementById("info").innerHTML += "<input type=\"button\" value=\"Play Again\" onclick=\"location.href='" + window.location.pathname + "';\">";
            //document.getElementById("info").innerHTML += "<input type=\"button\" value=\"Play Again\" onclick=\"main("+ input +")\">";
        }

        // draw everything at the end
        drawMap();
        drawPlayerColors();
        drawselectedTile();
        drawTriangles();
    });
}