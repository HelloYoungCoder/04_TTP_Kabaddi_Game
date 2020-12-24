// Teacher Training Program
// C35 to C48 
// Kabaddi Game

// Declaring Global Variables

var db;

var gameState, readState;
var raiderStatus, readRaiderStatus;

var redPosition, yellowPosition;

var redTeam, redTeamImg;
var yellowTeam, yellowTeamImg;

var lobby1, lobby2;
var balukLine1, balukLine2;
var bonusLine1, bonusLine2;

var readRedScore, redTeamScore;
var readYellowScore, yellowTeamScore;

var edges;

function preload() {

     redTeamImg = loadImage("assets/player1a.png");
     yellowTeamImg = loadImage("assets/player2a.png");

}

function setup() {

     var canvas = createCanvas(800, 400);

     //Creating Lobbies
     lobby1 = createSprite(400, 20, 800, 45);
     lobby1.shapeColor = rgb(255,127,80);
     lobby2 = createSprite(400, 380, 800, 45);
     lobby2.shapeColor = rgb(255,127,80);

     //Creating Baluk Line
     balukLine1 = createSprite(200, 200, 3, 315);
     balukLine1.shapeColor = "cream";

     balukLine2 = createSprite(600, 200, 3, 315);
     balukLine2.shapeColor = "cream";

     //Creating Bonus Line
     bonusLine1 = createSprite(120, 200, 3, 315);
     bonusLine1.shapeColor = "black";

     bonusLine2 = createSprite(680, 200, 3, 315);
     bonusLine2.shapeColor = "black";

     //Creating Players
     redTeam = createSprite(100, 200);
     redTeam.addImage('player1',redTeamImg);
     redTeam.scale = 0.45;

     yellowTeam = createSprite(700, 200);
     yellowTeam.addImage('player2',yellowTeamImg);
     yellowTeam.scale = 0.45;

     //redTeam.debug = true;
     //yellowTeam.debug = true;

     redTeam.setCollider("rectangle", 0, 0, 170, 120);
     yellowTeam.setCollider("rectangle", 0, 0, 150, 120);

     //Specify default settings
     textSize(15);
     fill("cream");
     textFont("Trebuchet MS");

     edges = createEdgeSprites();

     //Configure database
     db = firebase.database();

     //To read game state
     readState = db.ref('gameState');
     readState.on("value", function(data){
          gameState = data.val();
     });

     //To read raider status
     readRaiderStatus = db.ref('raiderStatus');
     readRaiderStatus.on("value", function(data){
          raiderStatus = data.val();
     });

     //To read position of players - Red Team
     var redPositionRef = db.ref('team1/position');
     redPositionRef.on("value", function(data){
          redPosition = data.val();
          //console.log(redPosition.x +" "+redPosition.y);
          redTeam.x = redPosition.x;
          redTeam.y = redPosition.y;
     });

     //To read position of players - Yellow Team
     var yellowPositionRef = db.ref('team2/position');
     yellowPositionRef.on("value", function(data){
          yellowPosition = data.val();
          //console.log(yellowPosition.x +" "+yellowPosition.y);
          yellowTeam.x = yellowPosition.x;
          yellowTeam.y = yellowPosition.y;
     });

     //To read score of players - Red Team
     var redScoreRef = db.ref('team1/score');
     redScoreRef.on("value", function(data){
          readRedScore = data.val();
          redTeamScore = readRedScore.score;
     });

     //To read score of players - Yellow Team
     var yellowScoreRef = db.ref('team2/score');
     yellowScoreRef.on("value", function(data){
          readYellowScore = data.val();
          yellowTeamScore = readYellowScore.score;
     });
}

function draw() {

     background(110, 86, 176);

     drawSprites();

     //Creating Midline
     push();
     stroke("cream");
     strokeWeight(3);
     line(400, 0, 400, 400);
     pop();

     //Display Score
     fill("red");
     textSize(15);
     text(redTeamScore, 50, 25);

     fill("yellow");
     text(yellowTeamScore, 750, 25);

     //Collide with edges
     redTeam.collide(edges[0]);
     redTeam.collide(edges[1]);

     yellowTeam.collide(edges[0]);
     yellowTeam.collide(edges[1]);

     if (gameState === 0) {
          textSize(25);
          fill(255,127,80);
          text("PRESS SPACE TO SERVE", 280, 200);
          //console.log(gameState);
     }

     if (keyDown("space") && gameState === 0) {
          generateToss();
          //console.log(raiderStatus);
          updateGameState(1);
     }

     if (gameState === 1) {

          //Assign Movements
          if (keyWentDown("w")) {
               changeRedPosition(0, -3);
          } else if (keyWentDown("s")) {
               changeRedPosition(0, 3);
          }

          if (keyWentDown("k")) {
               changeYellowPosition(0, -3);
          } else if (keyWentDown("m")) {
               changeYellowPosition(0, 3);
          }

          if (keyWentDown(LEFT_ARROW)) {
               changeTeamPosition(raiderStatus, -3, 0);
          } else if (keyWentDown(RIGHT_ARROW)) {
               changeTeamPosition(raiderStatus, 3, 0);
          }

          // Make player to be within boundaries
          redTeam.bounceOff(lobby1);
          redTeam.bounceOff(lobby2);

          yellowTeam.bounceOff(lobby1);
          yellowTeam.bounceOff(lobby2);

          // Allocate Score
          if (yellowTeam.isTouching(bonusLine1)) {
               updateScore("Yellow");
               resetPlayers();
               updateGameState(0);
          } else if (redTeam.isTouching(bonusLine2)) {
               updateScore("Red");
               resetPlayers();
               updateGameState(0);
          }

          // Winner | Runner
          if (redTeamScore === 20 || yellowTeamScore === 20) {
               updateGameState(2);
          }

          if (redTeam.isTouching(yellowTeam)) {
               if (redTeam.x > 600) {
                    alert("Hooo!! Red Team, You've Lost!!");
               }

               if (yellowTeam.x < 200) {
                    alert("Hooo!! Yellow Team, You've Lost!!");
               }
               
               //console.log(gameState);
               updateGameState(3);
          } 
     }

     //Display Message

     if (gameState === 2) {
          if (redTeamScore === 20) {
               alert("Congrats Red Team!!");
               resetPlayers();
               updateGameState(0);
          } else if (yellowTeamScore === 20) {
               alert("Congrats Yellow Team!!");
               resetPlayers();
               updateGameState(0);
          }
     }

     // Reset Players

     if (gameState === 3) {
         resetPlayers();
         //console.log(gameState);
         updateGameState(0);
     }
}

function changeRedPosition(xPos, yPos) {

     db.ref('team1/position').set({
          'x': redPosition.x + xPos,
          'y': redPosition.y + yPos
     });

}

function changeYellowPosition(xPos, yPos) {

     db.ref('team2/position').set({
          'x': yellowPosition.x + xPos,
          'y': yellowPosition.y + yPos
     });

}

function changeTeamPosition(raiderStatus, xPos, yPos) {
     if (raiderStatus === 0) {
          db.ref('team1/position').set({
               'x': redPosition.x + xPos,
               'y': redPosition.y + yPos
          });
     }
     if (raiderStatus === 1) {
          db.ref('team2/position').set({
               'x': yellowPosition.x + xPos,
               'y': yellowPosition.y + yPos
          });
     }
}

function generateToss() {
     //Read value
     //Swap it
     //Update in db
     let changeRaider;

     if (raiderStatus === 0) {
          changeRaider = 1;
     }

     if (raiderStatus === 1) {
          changeRaider = 0;
     }

     updateRaiderStatus(changeRaider);
}

//To update score
function  updateScore(team) {
     if (team === "Red") {
          db.ref('team1/score').update({
               'score' : redTeamScore + 5
          });
          db.ref('team2/score').update({
               'score' : yellowTeamScore - 5
          }); 
     } else if (team === "Yellow") {
          db.ref('team1/score').update({
               'score' : redTeamScore - 5
          });
          db.ref('team2/score').update({
               'score' : yellowTeamScore + 5
          }); 
     }
}

//To reset player position
function resetPlayers() {
     db.ref('team1/position').update({
          'x': 100,
          'y': 200
     });

     db.ref('team2/position').update({
          'x': 700,
          'y': 200
     });
}

//To update game state
function updateGameState(state) {
     db.ref('/').update({
       'gameState': state
     })
}

//To update raider status
function updateRaiderStatus(status) {
     db.ref('/').update({
       'raiderStatus': status
     })
}
