let myObs = [];
let myCheckpoints = [];
let btnSaveTrack;
let btnLoadTrack;
let myAIs = [];
let populationSize = 250;
let generationNumber = 0;
let simulationStep = 0;
let maxSimulationStep = 420;
let simulationStesPerDraw = 3;
let slider;
let slider2;
let pointsHistory = [];
let averagePoints = [];
let pointsHistoryPlot;
let drawGraph = false;
let drawHelp = true;
let carImage;
let burnedCarImage;
let explosionSpriteAnimation;
let explosionSpriteData;
let explosionSprite

const modes = {
  NONE: "none",
  OBSTACLES: "obstacles",
  CHECKPOINTS: "checkpoints"
}

let mode = modes.NONE;

function preload() {
  loadTrack();
  carImage = loadImage("assets/red_car.png");
  burnedCarImage = loadImage("assets/burned_car.png");
  explosionSpriteAnimation = loadImage("assets/Explosion.png");
  explosionSpriteData = loadJSON("assets/ExplosionData.json");
}

function setup() {
  let canvas = createCanvas(800, 480);
  canvas.parent("canvasContainer");
  explosionSprite = new Sprite(explosionSpriteAnimation, explosionSpriteData);
  explosionSprite.setSpeed(0.25);
  for (let i = 0; i < populationSize; i++) {
    myAIs[i] = new AINN();
    myAIs[i].car.setAnimations(carImage, burnedCarImage, explosionSprite.copy());
  }
  noStroke();
  btnSaveTrack = createButton('Save track');
  btnSaveTrack.parent("controlsContainer");
  btnSaveTrack.mousePressed(saveTrack);
  btnLoadTrack = createButton('Load track');
  btnLoadTrack.parent("controlsContainer");
  btnLoadTrack.mousePressed(loadTrack);
  slider = createSlider(1, 20, 1);
  slider.parent("controlsContainer");
  slider.value(3);
  slider.style('width', '180px');
  slider2 = createSlider(100, 1200, 1);
  slider2.parent("controlsContainer");
  slider2.style('width', '180px');
  slider2.value(600);
  pointsHistoryPlot = new GPlot(this, (width - 600) / 2, (height - 400) / 2, 600, 400);
  pointsHistoryPlot.setBgColor(color(255, 100));
  pointsHistoryPlot.setBoxBgColor(color(255, 0));
  pointsHistoryPlot.setBoxLineColor(0);
  pointsHistoryPlot.setMar(30, 30, 30, 30);
  pointsHistoryPlot.addLayer("average", averagePoints);
}

function draw() {
  //display suff in background
  background(86, 77, 68);
  for (obs of myObs) {
    obs.show();
  }
  for (check of myCheckpoints) {
    check.show();
  }

  //simulation stuff
  for (let i = 0; i < simulationStesPerDraw; i++) {

    let siguenVivos = false;
    for (myAI of myAIs) {
      if (!myAI.car.crashed) {
        myAI.run();
        myAI.car.run(myObs);
        myAI.car.checkPoint(myCheckpoints)
      }
      myAI.car.show();

      if (!myAI.car.crashed) {
        siguenVivos = true;
      }
    }

    if (simulationStep > maxSimulationStep || !siguenVivos) {
      nextGeneration()
      //noLoop();
      simulationStep = 0;
    }
    simulationStep++;
    simulationStesPerDraw = slider.value();
    maxSimulationStep = slider2.value();


  }


  //display stuff in fore ground

  push()
  fill(255);
  text(nf(frameRate(), 1, 1) + " FPS", 7, 15);
  text("Generation: " + generationNumber, 7, 30);
  text(nf(getHighPoints(myAIs).car.throttle,1,2),7,45);
  stroke(255);
  line(20,50,20+getHighPoints(myAIs).car.throttle*25,50);
  pop()
  getHighPoints(myAIs).showGenome(700, 250, 14, 6);


  if (drawGraph) {
    pointsHistoryPlot.defaultDraw();
  }
  if (drawHelp) {
    drawHelpFunction();
  }
  //noLoop();
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
  } else if (key == "G") {
    drawGraph = !drawGraph;
  } else if (key == "H") {
    drawHelp = !drawHelp;
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

function nextGeneration() {
  myAIs.sort(compare); //sort Ais form better to worse
  let averageGenerationPoints = 0;
  for (let ai of myAIs) {
    averageGenerationPoints += ai.car.points;
  }
  averagePoints.push(createVector(generationNumber, averageGenerationPoints / myAIs.length));
  pointsHistory.push(createVector(generationNumber, myAIs[0].car.points));
  pointsHistoryPlot.setPoints(pointsHistory);
  pointsHistoryPlot.getLayer("average").setPoints(averagePoints);


  let fitness = calculateFitness(myAIs);

  //console.log("ordenados");
  let matingPool = [];
  for (let i = 0; i < populationSize; i++) {
    let keepBetterSpecimens = 0.1; //keep top 10%
    if (i < populationSize * keepBetterSpecimens) {
      matingPool.push(myAIs[i]);
      matingPool[i].mutate();
    } else {
      let parentA = selectOne(myAIs, fitness).copy();
      let parentB = selectOne(myAIs, fitness).copy();
      let offspring = AINN.crossOver(parentA, parentB);
      offspring.mutate();
      matingPool.push(offspring);
    }
  }

  console.log("new populationSize " + matingPool.length);

  for (let i = 0; i < populationSize; i++) {
    myAIs[i] = matingPool[i].copy();
    myAIs[i].car.setAnimations(carImage, burnedCarImage, explosionSprite.copy());
  }
  generationNumber++;
  console.log("generation " + generationNumber);
  console.log("Max Fitness: " + max(fitness));
}

function calculateFitness(ais) {
  let sum = 0;
  for (let ai of ais) {
    sum += ai.car.points;
  }
  let fitness = [];
  for (let i = 0; i < ais.length; i++) {
    fitness[i] = ais[i].car.points / sum;
  }

  return fitness;
}

function selectOne(list, prob) {
  let index = 0;
  let r = random();
  while (r > 0) {
    r = r - prob[index];
    index++;
  }
  index--
  return list[index];
}

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const bandA = a.car.points;
  const bandB = b.car.points;

  let comparison = 0;
  if (bandA > bandB) {
    comparison = 1;
  } else if (bandA < bandB) {
    comparison = -1;
  }
  return comparison * -1;
}

function getHighPoints(ais) {
  let better = ais[0];
  for (let ai of ais) {
    if (ai.car.points > better.car.points) {
      better = ai;
    }
  }
  return better;
}

function drawHelpFunction() {
  push();
  fill(255, 50);
  let topPos = 20;
  let horPos = width - 170;
  let s = 15;
  textSize(s);
  rect(horPos, topPos, 150, 200);
  fill(255);
  let helpText = ["H: Show Help",
    "G: Show Graph",
    "M: Change Mode",
    "     (None, Obstacle,",
    "     Checkpoint)",
    "R: Reset Player Car",
    "V: Show Vectors"
  ];
  for (let i = 0; i < helpText.length; i++) {
    text(helpText[i], horPos + 5, topPos + 20 + 20 * i);
  }

  pop();
}
