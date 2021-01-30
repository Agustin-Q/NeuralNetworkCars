let myCubo;
let myObs = [];
let myCheckpoints = [];
let btnSaveTrack;
let btnLoadTrack;
let myAIs = [];
let populationNumber = 100;

const modes = {
  NONE: "none",
  OBSTACLES: "obstacles",
  CHECKPOINTS: "checkpoints"
}

let mode = modes.NONE;

function preload() {
  loadTrack();
}

function setup() {
  createCanvas(800, 480);
  myCubo = new Cubo(80, height / 2);
  for (let i = 0; i < populationNumber; i++){
    myAIs[i] = new AINN();
  }
  noStroke();
  btnSaveTrack = createButton('Save track');
  btnSaveTrack.position(20, height + 20);
  btnSaveTrack.mousePressed(saveTrack);
  btnLoadTrack = createButton('Load track');
  btnLoadTrack.position(110, height + 20);
  btnLoadTrack.mousePressed(loadTrack);
}

function draw() {
  background(86, 77, 68);
  manualControl(myCubo);
  for (myAI of myAIs){
  myAI.run();
  myAI.car.run(myObs);
  myAI.car.checkPoint(myCheckpoints)
  myAI.car.show();
}
  myCubo.run(myObs);
  myCubo.checkPoint(myCheckpoints);
  myCubo.show();
  for (obs of myObs) {
    obs.show();
  }
  for (check of myCheckpoints) {
    check.show();
  }
}

function manualControl(car) {
  let r = 0;
  let p = 0;
  if (keyIsDown(RIGHT_ARROW)) {
    r = 1;
  }
  if (keyIsDown(LEFT_ARROW)) {
    r = -1;
  }
  if (keyIsDown(UP_ARROW)) {
    p = 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    p = -1;
  }
  car.setThrottle(p);
  car.rotate(r);
}


let mx = 0;
let my = 0;

function mousePressed() {
  if (mouseX <= width && mouseY <= height) { //verificar que el cursor inice dentro del canvas
    mx = mouseX;
    my = mouseY;
  } else {
    mx = null;
    my = null;
  }
}

function mouseReleased() {
  if (mouseX <= width && mouseY <= height && mx != null && my != null) { //verificar que el cursor inicio dentro del canvas y verificar que finalize dentro del canvas
    if (mode == modes.OBSTACLES) {
      myObs.push(new Obstacle(mx, my, mouseX, mouseY, 255));
    } else if (mode == modes.CHECKPOINTS) {
      myCheckpoints.push(new Obstacle(mx, my, mouseX, mouseY, color(0, 200, 0)));
    }
  }
}

function keyPressed() {
  if (key == "R") {
    myCubo.reset();
    console.log("reset");
  } else if (key == "V") {
    myCubo.showRays = !myCubo.showRays;
    myCubo.showVelVector = !myCubo.showVelVector;
  } else if (key == "M") {
    switch (mode) {
      case modes.NONE:
        mode = modes.OBSTACLES
        break;
      case modes.OBSTACLES:
        mode = modes.CHECKPOINTS
        break;
      case modes.CHECKPOINTS:
        mode = modes.NONE
        break;
    }
  }
}


function saveTrack() {
  console.log(myObs);
  console.log(JSON.stringify(myObs));
  console.log(JSON.parse(JSON.stringify(myObs)));
  save(JSON.stringify(myObs), "track.json");
  save(JSON.stringify(myCheckpoints), "check.json");
}

let track;
let check;

function loadTrack() {
  track = loadStrings("track.json", loadCallback, errorCallback);
  check = loadStrings("check.json", loadCallback2, errorCallback2);
}

function loadCallback() {
  //console.log('track loaded.');
  //console.log(track[0]);
  //console.log(JSON.parse(JSON.parse(track[0])));
  track = JSON.parse(JSON.parse(track[0])); //porque 2 veces parse?, no lo se, pero funciona
  myObs = []; // reseto el Array
  for (let i = 0; i < track.length; i++) {
    myObs.push(new Obstacle(track[i].x1, track[i].y1, track[i].x2, track[i].y2, track[i].color));
  }
}

function loadCallback2() { // seguro hay una manera mejor que copiar y pegar esto asi, pero bueno
  //console.log('checkpoints loaded.');
  //console.log(check[0]);
  console.log(JSON.parse(JSON.parse(check[0])));
  check = JSON.parse(JSON.parse(check[0])); //porque 2 veces parse?, no lo se, pero funciona
  myCheckpoints = []; // reseto el Array
  for (let i = 0; i < check.length; i++) {
    myCheckpoints.push(new Obstacle(check[i].x1, check[i].y1, check[i].x2, check[i].y2, check[i].color.levels)); //hay que re hacer todo el tema de guardar y cargar pero paja
  }
}

function errorCallback() {
  console.log("error loading track");
}

function errorCallback2() {
  console.log("error loading checkpoints");
}
