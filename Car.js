class Cubo {
  constructor(w, h, img) {
    this.mass = 1000;
    this.pos = new p5.Vector(w, h);
    this.vel = new p5.Vector(0, 0);
    this.acc = new p5.Vector(0, 0);
    this.dir = new p5.Vector(0, -1);
    this.fricctionCoef = 0.1;
    this.maxPower = 1000;
    this.maxPowerReset = 1000; // valores mágicos por todos lados
    this.throttle = 0; //                ¯\_(ツ)_/¯
    this.turnR = 50;
    this.length = 18;
    this.width = 10;
    this.lidar = new Lidar(12);
    this.color = color(255, 255, 255);
    this.crashed = false;
    //to reset to inital conditios
    this.maxPowerReset = 1000;
    this.posReset = this.pos.copy();
    this.dirReset = this.dir.copy();

    //flags to control dispay
    this.showRays = false;
    this.showVelVector = false;

    //CHECKPOINTS
    this.lastCheckpoint = -1;
    this.points = 0;
    this.checkPointCounter = 0;

    this.carImg = img;
    this.carCrashedImg;
    this.explosionSprite;
  }

  run(obs) {
    //calcular fuerzas externas
    let force = new p5.Vector(0, 0);
    //calcular fuerzas internes
    force.add(this.calculateFriction());
    force.add(this.calculateDrag())
    force.add(this.calcPower())
    //aplicar fuerzas
    this.acc = force.div(this.mass);
    this.vel.add(this.acc);
    if (this.vel.mag() < 0.01) {
      this.vel.setMag(0);
    }
    this.pos.add(this.vel);

    this.lidar.pos = this.pos.copy();
    this.lidar.dir = this.dir.copy();

    if (this.isIntersecting(obs) != null) {
      this.color = color(255, 0, 0)
      this.crash();
    } else if (this.checkPointCounter <= 180) {
      this.color = color(255)
    }
    if (this.checkPointCounter > 180 && !this.crashed) { //180 es la vida sin que pasen por un checkpoint
      this.color = color(0, 0, 0)
      this.crash();
    }

    this.lidar.sense(obs);
  }

  rotate(a) {
    //console.log("la concha de tu madre");
    a = constrain(a, -1, 1);
    let ratio = constrain(this.vel.mag() / this.turnR, -1, 1);
    this.dir.rotate(a * asin(ratio)); //esto como maximo hace que gire en un circulo si no hay deslizamiento
  }

  calculateDrag() {
    let cd = 10;
    let dragForce = this.vel.copy();
    let mag = pow(dragForce.mag(), 2);
    dragForce.setMag(mag);
    dragForce.mult(-1 * cd);
    return dragForce;
  }

  calcPower() {
    let mag = (-0.1 * this.vel.mag() + 1) * this.maxPower * this.throttle;
    this.dir.normalize();
    return p5.Vector.mult(this.dir, mag);
  }

  setThrottle(t) {
    this.throttle = constrain(t, -1, 1);
  }

  calculateFriction() {
    //calcular fuerza de friccion
    if (this.vel.mag() != 0) {
      let zUnitVector = new p5.Vector(0, 0, 1)
      let perpDir = p5.Vector.cross(this.dir, zUnitVector)
      let dl = p5.Vector.dot(this.vel, perpDir) / this.vel.mag(); //deslizamiento lateral
      //let furezaFirction = 0.7*((dl/(0.1 + (dl)^2))+0.05*dl); // esto funciona misteriosiamente bien el ^es un XOR no tiene sentido que esto funcione
      let furezaFirction = 0.7 * ((dl / (0.1 + (dl * dl))) + 0.05 * dl);
      perpDir.normalize();
      perpDir.mult(-1 * furezaFirction * this.mass * this.fricctionCoef);
      return perpDir;
    } else {
      return new p5.Vector(0, 0);
    }
  }

  findCorners() {
    let zUnitVector = new p5.Vector(0, 0, 1);
    let perpDir = p5.Vector.cross(this.dir, zUnitVector).normalize();
    let l2 = this.dir.copy().normalize().mult(this.length / 2);
    let w2 = perpDir.copy().normalize().mult(this.width / 2);
    let p1 = this.pos.copy().add(l2).add(w2);
    let p2 = this.pos.copy().add(l2).sub(w2);
    let p3 = this.pos.copy().sub(l2).sub(w2);
    let p4 = this.pos.copy().sub(l2).add(w2);
    let corners = [p1, p2, p3, p4];
    return corners;
  }


  isIntersecting(obs) { //devuelve el index del primer collider que intrececta sino null
    let corners = this.findCorners();
    for (let j = 0; j < obs.length; j++) {
      for (let i = 0; i < 4; i++) {
        let nexti = (i + 1) % 4
        let inter = intersects(obs[j].x1, obs[j].y1, obs[j].x2, obs[j].y2, corners[i].x, corners[i].y, corners[nexti].x, corners[nexti].y);
        if (inter) {
          return j;
        }
      }
    }
    return null;
  }

  checkPoint(checkPoints) {
    let checkIndex = this.isIntersecting(checkPoints);
    let nextCheckIndex = this.lastCheckpoint + 1;
    nextCheckIndex >= checkPoints.length ? nextCheckIndex = 0 : false;
    if (checkIndex != null && checkIndex == nextCheckIndex) {
      this.points++;
      this.lastCheckpoint = checkIndex;
      this.lastCheckpoint == checkPoints.length;
      this.checkPointCounter = 0;
    }
    this.checkPointCounter++
  }

  crash() {
    if (!this.crashed) {
      this.vel.setMag(0);
      this.maxPower = 0;
      this.crashed = true;
      this.explosionSprite.setPos(this.pos.x, this.pos.y);
      this.explosionSprite.animateOnce();
    }
  }

  reset() {
    //console.log("reset car");
    this.acc.setMag(0);
    this.vel.setMag(0);
    this.pos = this.posReset.copy();
    this.dir = this.dirReset.copy();
    this.maxPower = this.maxPowerReset;
    this.points = 0;
    this.crashed = false;
  }




  setImage(img) {
    this.carImg = img;
  }

  setAnimations(img1, img2, sprt) {
    this.carImg = img1;
    this.carCrashedImg = img2;
    this.explosionSprite = sprt;
  }

  show() {
    this.showRays ? this.lidar.show() : false;
    push();
    rectMode(CENTER);
    translate(this.pos.x, this.pos.y);
    rotate(this.dir.heading());
    if (this.carImg == undefined) {
      fill(this.color);
      rect(0, 0, this.length, this.width);
      fill(0);
      rect(this.length / 4, 0, this.length * 0.25, this.width)
    }
    if (this.carImg != undefined) {
      imageMode(CENTER);
      rotate(-HALF_PI);
      let displayImg;
      this.crashed ? displayImg = this.carCrashedImg : displayImg = this.carImg;
      image(displayImg, 0, 0, this.width * 1.5, this.length * 1.5);
    }
    pop();
    if (this.showVelVector) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      stroke(0, 255, 0);
      line(0, 0, this.vel.mag() * 20, 0)
      pop();
    }

    this.explosionSprite.update();
  }

}

//---------------------------------------------------------------------------
class Obstacle {
  constructor(x1_, y1_, x2_, y2_, c) {
    this.x1 = x1_;
    this.y1 = y1_;
    this.x2 = x2_;
    this.y2 = y2_;
    this.color = c;
  }

  show() {
    push();
    stroke(this.color);
    line(this.x1, this.y1, this.x2, this.y2);
    pop();
  }

}

//---------------------------------------------------------------------------
class Lidar {
  constructor(n) {
    this.rays = [];
    this.raysLenght = 100;
    for (let i = 0; i < n; i++) {
      this.rays.push(p5.Vector.fromAngle(TWO_PI * i / n).mult(this.raysLenght));
    }
    this.pos = new p5.Vector(0, 0);
    this.dir = new p5.Vector(1, 0);
    this.output = new Array(n);
    for (let i = 0; i < this.output.length; i++) {
      this.output[i] = this.raysLenght;
    }
  }

  sense(obs) {
    this.resetOutput();
    for (let i = 0; i < this.rays.length; i++) {
      let p2 = this.rays[i].copy().rotate(this.dir.heading()).add(this.pos);
      for (let j = 0; j < obs.length; j++) {
        let sensDist = 0;
        let inter = line_intersect(obs[j].x1, obs[j].y1, obs[j].x2, obs[j].y2, this.pos.x, this.pos.y, p2.x, p2.y);

        if (inter == null) {
          sensDist = this.raysLenght;
        } else if (inter.seg1 == true && inter.seg2 == true) {
          let p3 = createVector(inter.x, inter.y);
          sensDist = p5.Vector.dist(this.pos, p3);
        } else {
          sensDist = this.raysLenght;
        }

        if (sensDist < this.output[i]) {
          this.output[i] = sensDist / this.raysLenght;
        }
      }
    }
    return this.output;
  }

  resetOutput() {
    for (let i = 0; i < this.output.length; i++) {
      this.output[i] = this.raysLenght;
    }
  }

  show() {
    push();
    stroke(255);
    strokeWeight(0.5);
    translate(this.pos.x, this.pos.y);
    rotate(this.dir.heading());
    for (let i = 0; i < this.rays.length; i++) {
      line(0, 0, this.rays[i].x, this.rays[i].y);

    }
    pop();
    push();
    stroke(255);
    strokeWeight(5);
    translate(this.pos.x, this.pos.y);
    rotate(this.dir.heading());
    for (let i = 0; i < this.output.length; i++) {
      let r = this.rays[i].copy().normalize().mult(this.output[i]);
      point(r.x, r.y);
    }
    pop();
  }

}


//---------------------------------------------------------------------------
//helper Functions

function intersects(a, b, c, d, p, q, r, s) {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  var ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom == 0) {
    return null;
  }
  ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1),
    seg1: ua >= 0 && ua <= 1,
    seg2: ub >= 0 && ub <= 1
  };
}
