// #################
// Global variables
// #################
var rowLength;
var player = {
  xCoord: 0,
  yCoord: 0,
  leftPos: 0,
  topPos: 0,
  inventory: []
};
var players = [];
var objects = [];
var boundarables = ["rock", "stump", "barrels"];
var inventorables = ["banana", "crate"];
var playerState = "right";
var timer;

// ###############
// Subprimitives
// ###############

// Get object by ID
function getObject(id) {
  var coords = numToCoords(id);
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    if (obj.x === coords.x && obj.y === coords.y) {
      return obj;
    }
  }
  return null;
}

// Get Random Number within a range
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Add object of certain type at (x, y)
function addObject(type, x, y, canRotate, canScale, hueShiftTrees) {
  var newObj = {
    type: type,
    x: x,
    y: y
  };
  newObj.isBoundarable = boundarables.includes(type) ? true : false;
  newObj.isInventorable = inventorables.includes(type) ? true : false;
  var objElem = document.createElement("div");
  objElem.className = type;
  if (canRotate === true) {
    objElem.style.transform = "rotateZ(" + (Math.floor(Math.random() * 360)) + "deg)";
  }
  if (canScale === true) {
    var scale = getRandomInt(150, 250);
    objElem.style.width = scale + "px";
    objElem.style.height = scale + "px";
  }
  if (hueShiftTrees === true) {
    var colorShift = getRandomInt(0, 50);
    objElem.style.filter = "hue-rotate(" + colorShift + "deg)";
  }
  var tileNum = reverse(y, rowLength) * rowLength + x;
  if (document.getElementById(tileNum).innerHTML === "") {
    document.getElementById(tileNum).appendChild(objElem);
    objects.push(newObj);
  }
}

// Move other player to (x, y)
function moveOtherPlayer(otherPlayer, x, y, direction) {
  otherPlayer.xCoord = x;
  otherPlayer.yCoord = y;
  otherPlayer.leftPos = otherPlayer.xCoord * 100;
  otherPlayer.topPos = reverse(otherPlayer.yCoord, rowLength) * 100;
  var otherPlayerElem = document.getElementById(otherPlayer.id);
  switch (direction) {
    case "left":
      otherPlayerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(270deg)";
      break;
    case "up":
      otherPlayerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(0deg)";
      break;
    case "right":
      otherPlayerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(90deg)";
      break;
    case "down":
      otherPlayerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(180deg)";
      break;
  }
  updateView();
}


// Move player to (x, y)
var wallHit = new Audio('wall.mp3');
function movePlayer(x, y) {
  var objectAtXY = getObject(coordsToNum(x, y));
  if (objectAtXY) {
    if (objectAtXY.isBoundarable) {
      wallHit.play();
      return;
    }
  }
  if (x < 0) {
    player.xCoord = 0;
  } else if (x > rowLength - 1) {
    player.xCoord = rowLength - 1;
  } else {
    player.xCoord = x;
  }
  if (y < 1) {
    player.yCoord = 1;
  } else if (y > rowLength) {
    player.yCoord = rowLength;
  } else {
    player.yCoord = y;
  }
  player.leftPos = player.xCoord * 100;
  player.topPos = reverse(player.yCoord, rowLength) * 100;
  updateView();
  if (objectAtXY) {
    if (objectAtXY.isInventorable) {
      removeObjectById(coordsToNum(x, y));
      addToInventory(objectAtXY);
    }
  }
}

// Get number of object of type in objects
function numOfInObjects(type) {
  var num = 0;
  for (var obj of objects) {
    if (obj.type === type) {
      num++;
    }
  }
  return num;
}

// Add object to inventory
function addToInventory(obj) {
  player.inventory.push(obj);
  if (obj.type === "banana") {
    updateBananaCounter();
    if (numOfInInventory("banana") === 10) {
      stopTimer();
      var timerElem = document.getElementById("timer");
      var timerText = timerElem.innerHTML;
      var showingTime = false;
      timerElem.innerHTML = "<img src='https://ffacoach.com/wp-content/uploads/2018/11/gold-medal-png-image-11831.png'> Winner!";
      setInterval(() => {
        if (showingTime) {
          showingTime = false;
          timerElem.innerHTML = "<img src='https://ffacoach.com/wp-content/uploads/2018/11/gold-medal-png-image-11831.png'> Winner!";
          return;
        }
        showingTime = true;
        timerElem.innerHTML = timerText;
      }, 1000);
    }
  } else if (obj.type === "crate") {
    updateAmmoCounter();
  }
}

// Update banana counter element
var audioGem = new Audio('crystal.mp3');
function updateBananaCounter() {
  audioGem.play()
  document.getElementById("bananas").innerHTML = "<img src='assets/gem.gif'> " + numOfInInventory("banana");
}

// Update ammo counter element
var audioReload = new Audio('reload.mp3');
function updateAmmoCounter() {
  audioReload.play()
  document.getElementById("ammo").innerHTML = "<img src='assets/crate.png'> " + numOfInInventory("crate");
}

// Get number of object of type in inventory
function numOfInInventory(type) {
  var num = 0;
  for (var item of player.inventory) {
    if (item.type === type) {
      num++;
    }
  }
  return num;
}

// Remove object by ID
function removeObjectById(id) {
  var coords = numToCoords(id);
  objects.push(objects.splice(objects.indexOf(getObject(id)), 1)[0]);
  objects.pop();
  document.getElementById(id).innerHTML = "";
}

// Update view and player element location
function updateView() {
  //window.scrollTo(player.leftPos - (window.innerWidth / 2 - (window.innerWidth / 2 % 100)), player.topPos - (window.innerHeight / 2 - (window.innerHeight / 2 % 100)));
  window.scrollTo({
    left: player.leftPos - (window.innerWidth / 2 - (window.innerWidth / 2 % 100)),
    top: player.topPos - (window.innerHeight / 2 - (window.innerHeight / 2 % 100)),
    behavior: 'smooth'
  });
  var playerElem = document.getElementById("player");
  playerElem.style.left = player.leftPos + "px";
  playerElem.style.top = player.topPos + "px";
  document.getElementById("position").innerHTML = "<img src='assets/compass.png'> (" + (player.xCoord) + "," + (player.yCoord) + ")";
  console.log(players.length);
  for (var i = 0; i < players.length; i++) {
    console.log(i);
    var otherPlayer = players[i];
    console.log(otherPlayer);
    var otherPlayerElem = document.getElementById(otherPlayer.id);
    otherPlayerElem.style.left = otherPlayer.leftPos + "px";
    otherPlayerElem.style.top = otherPlayer.topPos + "px";
  }
}

// Start timer interval
function startTimer() {
  var interval = setInterval(() => {
    timer.counterSec++;
    if (timer.counterSec === 60) {
      timer.counterSec = 0;
      timer.counterMin++;
    }
    updateTimer();
  }, 1000);
  timer = {
    int: interval,
    counterSec: 0,
    counterMin: 0
  };
  updateTimer();
}

// Stop timer interval
function stopTimer() {
  clearInterval(timer.int);
}

// Update timer element
function updateTimer() {
  var secStr = timer.counterSec;
  var minStr = timer.counterMin;
  if (secStr < 10) {
    secStr = "0" + secStr;
  }
  if (minStr < 10) {
    minStr = "0" + minStr;
  }
  document.getElementById("timer").innerHTML = "<img src='assets/timer.png'> " + minStr + ":" + secStr;
}

// function addPlayer(id) {
//   var newPlayer = {
//     id: id,
//     xCoord: 0,
//     yCoord: 0,
//     leftPos: 0,
//     topPos: 0
//   };
//   players.push(newPlayer);
//   console.log(players);
//   var playerElem = document.createElement("div");
//   playerElem.setAttribute("id", id);
//   playerElem.className = "player";
//   document.body.appendChild(playerElem);
// }

// function getPlayer(id) {
//   for (var otherPlayer of players) {
//     if (otherPlayer.id === id) {
//       return otherPlayer;
//     }
//   }
//   return null;
// }

// ##################
// Utility functions
// ##################

// Get reverse of number in range
function reverse(number, range) {
  var half = range / 2;
  var reverse = half + (-1 * (number - half));
  return reverse;
}

// Get coordinates matching ID of num
function numToCoords(num) {
  var y = reverse(Math.floor(num / rowLength), rowLength);
  var x = num % rowLength;
  return {
    x: x,
    y: y
  };
}

// Get ID matching coords (x, y)
function coordsToNum(x, y) {
  var num = reverse(y, rowLength) * rowLength + x;
  return num;
}

// Get random number in range
function randomNum(range) {
  return Math.floor(Math.random() * range);
}

// ###############
// Event handlers
// ###############
var footstepAudio = new Audio('footstep.mp3');
var playerElem = document.getElementById("player");

function handleKeyUp(event) {
  var key = event.keyCode;
  switch (key) {
    case 37:
      movePlayer(player.xCoord - 1, player.yCoord);
      playerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(180deg)";
      footstepAudio.play();
      break;
    case 38:
      movePlayer(player.xCoord, player.yCoord + 1);
      playerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(270deg)";
      footstepAudio.play();
      break;
    case 39:
      movePlayer(player.xCoord + 1, player.yCoord);
      playerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(0deg)";
      footstepAudio.play();
      break;
    case 40:
      movePlayer(player.xCoord, player.yCoord - 1);
      playerElem.style.transform = "translateX(50%) translateY(50%) rotateZ(90deg)";
      footstepAudio.play();
      break;
  }
}

// Window load event handler
window.addEventListener("load", () => {
  playerElem.style.filter = "hue-rotate(" + Math.random() * 360 + "deg)";
  rowLength = Math.sqrt(document.getElementsByClassName("block").length);
  var tileNum = 0;
  for (var tile of document.getElementsByClassName("block")) {
    tile.setAttribute("id", tileNum);
    tileNum++;
  }
  movePlayer(rowLength / 2, rowLength / 2);
  updateView();
  // addPlayer("test");
  // moveOtherPlayer(getPlayer("test"), 25, 25);
  // Generate Bananas
  for (var i = 0; i < 10; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("banana", randCoords.x, randCoords.y, false, false, false);
  }

  // Generate Crate
  for (var i = 0; i < 10; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("crate", randCoords.x, randCoords.y, true, false, false);
  }


  // Generate Trees
  for (var i = 0; i < 200; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("tree", randCoords.x, randCoords.y, true, true, false);
  }

  // Generate Tree 2
  for (var i = 0; i < 300; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("tree2", randCoords.x, randCoords.y, true, true, true);
  }

  // Generate Grass
  for (var i = 0; i < 300; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("grass", randCoords.x, randCoords.y, true, false, true);
  }

  // Generate Stump
  for (var i = 0; i < 200; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("stump", randCoords.x, randCoords.y, true, false, false);
  }

  // Generate Rock
  for (var i = 0; i < 200; i++) {
    var randNum = randomNum(Math.pow(rowLength, 2));
    var randCoords = numToCoords(randNum);
    addObject("rock", randCoords.x, randCoords.y, true, false, false);
  }

    // Generate Barrels
    for (var i = 0; i < 100; i++) {
      var randNum = randomNum(Math.pow(rowLength, 2));
      var randCoords = numToCoords(randNum);
      addObject("barrels", randCoords.x, randCoords.y, true, false, false);
    }

  document.addEventListener("keydown", handleKeyUp);
  // for (var tile of document.getElementsByClassName("block")) {
  //   if (tile.innerHTML !== "") {
  //     continue;
  //   }
  //   var id = tile.getAttribute("id");
  //   var randNum = Math.floor(Math.random() * 10);
  //   var coords = numToCoords(id);
  //   if (randNum < 1) {
  //     addObject("rock", coords.x, coords.y);
  //   }
  //   tile.style.transform = "rotateZ(" + (Math.floor(Math.random() * 360)) + "deg)";
  // }
  startTimer();
  var i = 0;
  var otherPlayer = getPlayer("test");
  setInterval(() => {
    switch (i) {
      case 0:
        moveOtherPlayer(otherPlayer, otherPlayer.xCoord - 1, otherPlayer.yCoord, "left");
        i++;
        break;
      case 1:
        moveOtherPlayer(otherPlayer, otherPlayer.xCoord, otherPlayer.yCoord - 1, "down");
        i++;
        break;
      case 2:
        moveOtherPlayer(otherPlayer, otherPlayer.xCoord + 1, otherPlayer.yCoord, "right");
        i++;
        break;
      case 3:
        moveOtherPlayer(otherPlayer, otherPlayer.xCoord, otherPlayer.yCoord + 1, "up");
        i = 0;
        break;
    }
  }, 1000);
});

var audio = new Audio('gametheme.mp3');
var ambience = new Audio('ambience.mp3')
function gameStartButton() {
  document.getElementById("initialPopup").style.display = "none";
  audio.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
  }, false);
  audio.play();

  ambience.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
  }, false);
  ambience.play();
}