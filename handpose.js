const knnClassifier = ml5.KNNClassifier();

let handpose;
let video;
let hands = [];

const options = {
    flipHorizontal: true, // boolean value for if the video should be flipped, defaults to false
    maxContinuousChecks: Infinity, // How many frames to go without running the bounding box detector. Defaults to infinity, but try a lower value if the detector is consistently producing bad predictions.
    detectionConfidence: 0.8, // Threshold for discarding a prediction. Defaults to 0.8.
    scoreThreshold: 0.75, // A threshold for removing multiple (likely duplicate) detections based on a "non-maximum suppression" algorithm. Defaults to 0.75
    iouThreshold: 0.3, // A float representing the threshold for deciding whether boxes overlap too much in non-maximum suppression. Must be between [0, 1]. Defaults to 0.3.
}

// let trainOneButton = document.querySelector('#one');
// trainOneButton.addEventListener("click", () => trainKnn('right'));
//
// let traintwoButton = document.querySelector('#two');
// traintwoButton.addEventListener("click", () => trainKnn('left'));
//
// let trainthreeButton = document.querySelector('#three');
// trainthreeButton.addEventListener("click", () => trainKnn('rest'));
//
// let saveButton = document.querySelector('#save');
// saveButton.addEventListener("click", () => knnClassifier.save('model'))
//
// let predictButton = document.querySelector('#predict');
// predictButton.addEventListener('click', () => appear = true);
//
// let prediction = document.querySelector('#prediction');

// let video = document.querySelector('#video');

function setup() {

    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);

    handpose = ml5.handpose(video, options, modelReady);

    // This sets up an event that fills the global variable "predictions"
    // with an array every time new hand poses are detected
    handpose.on("hand", results => {

        hands = results;

        if (hands != '') {
            classify()
        } else {
            eventHandler('empty');
        }

    });

    // Hide the video element, and just show the canvas
    video.hide();
}

function classify() {

    let handPose = [];

    for (let i = 0; i < 20; i++) {

        handPose.push(hands[0].landmarks[0])
        handPose.push(hands[0].landmarks[1])

    }

    knnClassifier.classify(handPose, (err, result) => {

        if (result) {
            eventHandler(result.label);
        }

    });

}

async function trainKnn(pose) {

    let handPose = [];

    for (let i = 0; i < 20; i++) {

        handPose.push(hands[0].landmarks[0])
        handPose.push(hands[0].landmarks[1])

    }

    knnClassifier.addExample(handPose, pose);

}

async function modelReady() {

    knnClassifier.load('model.json');

    draw()

}

function draw() {
    image(video, 0, 0, width, height)

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    for (let i = 0; i < hands.length; i += 1) {
        const hand = hands[i];
        for (let j = 0; j < hand.landmarks.length; j += 1) {
            const keypoint = hand.landmarks[j];
            fill(0, 255, 0);
            noStroke();
            ellipse(keypoint[0], keypoint[1], 10, 10);
        }
    }

}

//The Game


let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let rect = canvas.getBoundingClientRect();
canvas.width = rect.width;
canvas.height = rect.height ;

ctx.scale(devicePixelRatio, devicePixelRatio);

let scale = window.devicePixelRatio;

ctx.scale(scale, scale);

let ballRadius = 5;

// start position ball
let x = canvas.width / 2;
let y = canvas.height - 30;


// start direction + speed from ball
let dx = 7;
let dy = -7;

// paddle size
let paddleHeight = 5;
let paddleWidth = 75;

// start position of paddle
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let brickRowCount = 10;

// left to right brick count
let brickColumnCount = 7;

// brick size
let brickWidth = 40;
let brickHeight = 8;

// space between the bricks - left to right
let brickPadding = 10;

let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score = 0;
let lives = 3;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = {x: 0, y: 0, status: 1};
    }
}

// event listener for pressing keys
let gameInfo = document.querySelector(".gameinfo");

let playButton = document.querySelector('#play');
playButton.addEventListener('click', drawGame);

function eventHandler(sign) {

    switch (sign) {
        case '0':
            rightPressed = true
            leftPressed = false
            break;
        case '1':
            leftPressed = true
            rightPressed = false
            break;
        case 'empty':
            leftPressed = false
            rightPressed = false
    }

}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#edf2f4";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#edf2f4";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 1; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#edf2f4";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#edf2f4";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#edf2f4";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}


function drawGame(sign) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    gameInfo.classList.remove("gameinfo")
    gameInfo.classList.add("none");
    playButton.classList.remove("startbutton");
    playButton.classList.add("none");


    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 7;
                dy = -7;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    console.log(rightPressed);

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 9;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 9;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(drawGame);
}

drawBricks();
drawBall();
drawPaddle();
drawScore();
drawLives();
collisionDetection();

