//select canvas

const cvs = document.getElementById("pong");
const ctx = cvs.getContext("2d");


//create userL paddle
const userL = {
    x : 0,
    y : cvs.height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

//create userR paddle
const userR = {
    x : cvs.width - 10,
    y : cvs. height/2 - 100/2,
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

//create the ball
const ball = {
    x : cvs.width/2,
    y : cvs. height/2,
    radius : 10,
    speed : 5,
    velocityX : 5,
    velocityY : 5,
    color : "WHITE"
}




//draw rectangle function (for background)

function drawRect(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

//CREATE THE NET
const net = {
    x : cvs.width/2 - 1,
    y : 0,
    width : 2,
    height : 10,
    color : "WHITE"
}

//DRAW THE NET
function drawNet(){
    for (let i = 0; i <= cvs.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

//draw Circle (the ball)

function drawCircle(x,y,r,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,false);
    ctx.closePath();
    ctx.fill();
}


//draw text

function drawText(text,x,y,color){
    ctx.fillStyle = color;
    ctx.font = "45px fantasy";
    ctx.fillText(text,x,y);
}

function drawText_mini(text,x,y,color){
    ctx.fillStyle = color;
    ctx.font = "20px arial";
    ctx.fillText(text,x,y);
}


function render(){
    //clear the canvas
    drawRect(0,0,cvs.width, cvs.height, "PINK")

    //draw the net
    drawNet();

    //draw score
    drawText(userL.score, cvs.width/4, cvs.height/5,"WHITE");
    drawText(userR.score, 3*cvs.width/4, cvs.height/5,"WHITE");

    //draw the paddles
    drawRect(userL.x, userL.y, userL.width, userL.height, userL.color);
    drawRect(userR.x, userR.y, userR.width, userR.height, userR.color);

    //draw the ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    if (userL.score === 3 || userR.score === 3) {
        drawRect(0,0,cvs.width, cvs.height, "PINK")
        let winner = userL.score === 3 ? "Player 1" : "Player 2";
        drawText(`${winner} won!`, cvs.width/2 - 100, cvs.height/2, "WHITE");
        drawText_mini("Pres SPACE to restart!", cvs.width/2-80,cvs.height/2+50, "WHITE")
    }
}


//control user paddle

document.addEventListener("keydown", movePaddle);

function movePaddle(evt){
    let rect = cvs.getBoundingClientRect();

    // first user - arrows up/down
    if(evt.keyCode === 38){ // arrow up
        userR.y = Math.max(userR.height/600, userR.y - 10); // limits up
    }else if(evt.keyCode === 40){ // Săgeata Jos
        userR.y = Math.min(cvs.height - userR.height, userR.y + 10); // limits down
    }

    // second user - W/S keys
    if(evt.keyCode === 87){ // W key
        userL.y = Math.max(userL.height/600, userL.y - 10); // limits up
    }else if(evt.keyCode === 83){ // S key
        userL.y = Math.min(cvs.height - userL.height, userL.y + 10); // limits down
    }

}


//COLLISION DETECTION (b = ball, p = paddle)
function collision(b,p){
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}


//RESET BALL
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = cvs.height/2;

    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
}


function endGame(){

    //add event listener to start new game
    document.addEventListener("keydown", resetGame);
}

function resetGame(evt){
    if(evt.keyCode === 32){ //space bar key
        //remove event listener and reset game state
        document.removeEventListener("keydown", resetGame);
        userL.score = 0;
        userR.score = 0;
        userL.y = cvs.height / 2 - 50;
        userR.y = cvs.height / 2 - 50;
        resetBall();
    }
}


//UPDATE: POS, MOV, SCORE, ...
function update(){

    //IF THE BALL HITS THE MARGINS, THROW BACK
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    if(ball.y + ball.radius > cvs.height || ball.y - ball.radius < 0){
        ball.velocityY = -ball.velocityY;
    }

    let player = (ball.x < cvs.width/2) ? userL : userR;

    if(collision(ball,player)){
        //where the ball hit the player
        let collidePoint = ball.y - (player.y + player.height/2);

        //normalization
        collidePoint = collidePoint/(player.height/2);

        //calculate angle in Radian
        let angleRad = collidePoint * Math.PI/4;

        //X direction of the ball when hit
        let direction = (ball.x <cvs.width/2) ? 1 : -1;

        //change vel X and Y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = direction * ball.speed * Math.sin(angleRad);

        // every time the ball hit a paddle, we increase its speed
        ball.speed += 0.5;
    }

    //UPDATE THE SCORE

    if (userR.score !== 3 && userL.score !== 3) {
        if (ball.x - ball.radius < 0) {
            //the userR won
            userR.score++;
            resetBall();
        } else if (ball.x + ball.radius > cvs.width) {
            //the userL won
            userL.score++;
            resetBall();
        }
    }

    //check if either player has won
    else if(userL.score === 3 || userR.score === 3){
        endGame();
        return;
    }


}


//GAME INIT
function game(){
    update();
    render();
}

//LOOP
const framePerSecond = 50;
setInterval(game, 1000/framePerSecond);


































