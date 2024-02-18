/* 
========================================================================
*/
// player.locX = Math.floor(500 * Math.random() + 10); // horizontal axis
// player.locY = Math.floor(500 * Math.random() + 10); // vertical axis

//==========================
//===========DRAW===========
//==========================

const canvas = document.getElementById("the-canvas");
// TODO two foreach in under code has problem !!!
var draw = () => {
  //reset the context traslate back to default
  context.setTransform(1, 0, 0, 1, 0, 0);

  //clearRect clears out the canvas, so we can draw on a clean canvas next frame/draw()
  context.clearRect(0, 0, canvas.width, canvas.height);

  //clamp the screen/vp to the players location (x,y)
  const camX = -player.locX + canvas.width / 2;
  const camY = -player.locY + canvas.height / 2;

  //translate moves the cavnas/context to where the player is at
  context.translate(camX, camY);

  //draw all the players
  players.forEach((p) => {
    if (!p.playerData) {
      //if the playerData doesn't exist, this is an absobred player and we don't draw
      return;
    }
    context.beginPath();
    context.fillStyle = p.playerData.color;
    context.arc(
      p.playerData.locX,
      p.playerData.locY,
      p.playerData.radius,
      0,
      Math.PI * 2
    ); //draw an arc/circle
    // context.arc(200,200,10,0,Math.PI*2) //draw an arc/circle
    //arg1 and arg2 are center x and centery of the arc
    //arg3 = radius of the circle
    //arg4 = where to start drawing in radians - 0 = 3:00
    //arg 5 = where to stop drawing in radians - Pi = 90deg
    context.fill();
    context.lineWidth = 3; //how wide to draw a line in pixels
    context.strokeStyle = "rgb(0,255,0)"; // draw a green line
    context.stroke(); //draw the line (border)
  });

  //draw all the orbs
  orbs.forEach((orb) => {
    context.beginPath(); //this will start a new path
    context.fillStyle = orb.color;
    context.arc(orb.locX, orb.locY, orb.radius, 0, Math.PI * 2);
    context.fill();
  });

  // requestAnimationFrame is like a controlled loop
  // it runs recursively, every paint/frame. If the framerate is 35 fps
  requestAnimationFrame(draw);
};

canvas.addEventListener("mousemove", (event) => {
  // console.log(event)
  const mousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
  const angleDeg =
    (Math.atan2(
      mousePosition.y - canvas.height / 2,
      mousePosition.x - canvas.width / 2
    ) *
      180) /
    Math.PI;
  if (angleDeg >= 0 && angleDeg < 90) {
    xVector = 1 - angleDeg / 90;
    yVector = -(angleDeg / 90);
    console.log("Mouse is in the lower right quardrant");
  } else if (angleDeg >= 90 && angleDeg <= 180) {
    xVector = -(angleDeg - 90) / 90;
    yVector = -(1 - (angleDeg - 90) / 90);
    console.log("Mouse is in the lower left quardrant");
  } else if (angleDeg >= -180 && angleDeg < -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 + (angleDeg + 90) / 90;
    console.log("Mouse is in the top left quardrant");
  } else if (angleDeg < 0 && angleDeg >= -90) {
    xVector = (angleDeg + 90) / 90;
    yVector = 1 - (angleDeg + 90) / 90;
    console.log("Mouse is in the top right quardrant");
  }

  player.xVector = xVector ? xVector : 0.1;
  player.yVector = yVector ? yVector : 0.1;
});

/* 
========================================================================
*/

// const io = require("socket.io");
// import io from "socket.io";
//connect to the socket server!
const socket = io.connect("http://localhost:9600");

const init = async () => {
  console.log(`socket`, socket);
  //init is called inside of start-game click listener
  const initData = await socket.timeout(120000).emitWithAck("init", {
    // emitWithAct
    playerName: player.name,
  });

  //our await has resolved, so start 'tocking'
  setInterval(async () => {
    socket.emit("tock", {
      xVector: player.xVector ? player.xVector : 0.1,
      yVector: player.yVector ? player.yVector : 0.1,
    });
  }, 33);
  console.log(initData, initData.orbs);
  orbs = initData.orbs;
  player.indexInPlayers = initData.indexInPlayers;
  draw(); //draw function is in canvasStuff
};
window.init = init;
//the server sends out the location/data of all players 30/second
socket.on("tick", (playersArray) => {
  players = playersArray;
  console.log(players);
  if (players[player.indexInPlayers]?.playerData) {
    //this never  runs
    player.locX = players[player.indexInPlayers].playerData.locX;
    player.locY = players[player.indexInPlayers].playerData.locY;
  }
});

socket.on("orbSwitch", (orbData) => {
  //the server just told us that an orb was absorbed. Replace it in the orbs array!
  orbs.splice(orbData.capturedOrbI, 1, orbData.newOrb);
});

socket.on("playerAbsorbed", (absorbData) => {
  document.querySelector(
    "#game-message"
  ).innerHTML = `${absorbData.absorbed} was absorbed by ${absorbData.absorbedBy}`;
  document.querySelector("#game-message").style.opacity = 1;
  window.setTimeout(() => {
    document.querySelector("#game-message").style.opacity = 0;
  }, 2000);
});

socket.on("updateLeaderBoard", (leaderBoardArray) => {
  // console.log(leaderBoardArray)
  leaderBoardArray.sort((a, b) => {
    return b.score - a.score;
  });
  document.querySelector(".leader-board").innerHTML = "";
  leaderBoardArray.forEach((p) => {
    if (!p.name) {
      return;
    }
    document.querySelector(".leader-board").innerHTML += `
                <li class="leaderboard-player">${p.name} - ${p.score}</li>
            `;
  });
  const el = leaderBoardArray.find((u) => u.name === player.name);
  document.querySelector(".player-score").innerHTML = el.score;
});

/* ---------------------------------------------------------------------------------------------- */
// const init = require("./socketStuff");
// import { init } from "./socketStuff";
//set height and width of canvas = window
let wHeight = window.innerHeight;
let wWidth = window.innerWidth;
//canvas element needs to be in a variable
// const canvas = document.querySelector("#the-canvas");
//context is how we draw! We will be drawing in 2d
const context = canvas.getContext("2d");
//set the canvas height and width to = window height and width
canvas.height = wHeight;
canvas.width = wWidth;
const player = {}; //This will be all things "this" player
let orbs = []; //this is a global for all non-player orbs
let players = []; //this is an array of all players

//put the modals into variables so we can interact with them
const loginModal = new bootstrap.Modal(document.querySelector("#loginModal"));
const spawnModal = new bootstrap.Modal(document.querySelector("#spawnModal"));

window.addEventListener("load", () => {
  //on page load, open the login modal
  loginModal.show();
});

document.querySelector(".name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  // console.log("SUbmitted!")
  player.name = document.querySelector("#name-input").value;
  document.querySelector(".player-name").innerHTML = player.name;
  loginModal.hide();
  spawnModal.show();
  console.log(player);
});

document.querySelector(".start-game").addEventListener("click", (e) => {
  //hide the start modal
  spawnModal.hide();
  //show the hiddenOnStart elements
  const elArray = Array.from(document.querySelectorAll(".hiddenOnStart"));
  elArray.forEach((el) => el.removeAttribute("hidden"));
  init(); //init is inside of socketStuff.js
});

/* ---------------------------------------------------------------------------------------------- */
