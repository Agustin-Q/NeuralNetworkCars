class AINN {
  constructor(nn) {
    this.car = new Cubo(80, height / 2);
    if (nn instanceof NeuralNetwork) {
      this.nn = nn.copy();
    } else {
      this.nn = new NeuralNetwork(this.car.lidar.rays.length+4, 18, 2);
    }
  }

  run() {
    //if (!this.car.crashed){
    let inputs = []
    for (let out of this.car.lidar.output){
      inputs.push(out);
    }
    inputs.push(this.car.vel.x);
    inputs.push(this.car.vel.y);
    inputs.push(this.car.dir.x);
    inputs.push(this.car.dir.y);
    //console.log(inputs);
    //console.log(this.car.lidar.output);
    //let nnOutput = this.nn.predict(this.car.lidar.output);
    let nnOutput = this.nn.predict(inputs);
    this.car.setThrottle(map(nnOutput[0], 0, 1, -1, 1));
    this.car.rotate(map(nnOutput[1], 0, 1, -1, 1));
    //}
  }

  copy() {
    return new AINN(this.nn);
  }

  mutate() {
    this.nn.mutate(this.mutateFunction);
  }

  mutateFunction(x) {
    if (random() < 0.02) {
      return x+random(-0.1,0.1);
    } else {
      return x;
    }
  }

  static crossOver(ai1, ai2) {
    let childAI = ai1.copy();
    //console.log(childAI);
    //loop w IH
    this.recombine(childAI.nn.weights_ih, ai2.nn.weights_ih);
    //loop b IH
    this.recombine(childAI.nn.bias_h, ai2.nn.bias_h);
    //loop w HO
    this.recombine(childAI.nn.weights_ho, ai2.nn.weights_ho);
    //Loop b HO
    this.recombine(childAI.nn.bias_o, ai2.nn.bias_o);
    return childAI;
  }

  static recombine(mA, mB) { //non static modifica la matriz mA
    if (mA.rows != mB.rows || mA.cols != mB.cols) { //revisa que las dos matrices tengan las mismas dimensiones
      return undefined;
    }
    for (let i = 0; i < mA.rows; i++) {
      for (let j = 0; j < mA.cols; j++) {
        if (random() > 0.5) {
          mA.data[i][j] = mB.data[i][j];
        }
      }
    }
    return mA;
  }

  getGenome(){
    let genome = [];
    genome = genome.concat(this.nn.weights_ih.toArray());
    genome = genome.concat(this.nn.bias_h.toArray());
    genome = genome.concat(this.nn.weights_ho.toArray());
    genome = genome.concat(this.nn.bias_o.toArray());
    return genome;
  }

  showGenome(x, y, w, s) {
    //set style
    push();
    noStroke();
    let genome = this.getGenome();
    let index = 0;
    let rows = ceil(genome.length / w);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < w; j++) {
        if (index < genome.length) {
          fill(map(genome[index], -1, 1, 0, 255));
          rect(x + s * j, y + s * i, s,s);
        }
        index++;
      }
    }
    pop();
  }


}

//--------------------------------------------------

class AI { // ai con pid
  constructor() {
    this.car = new Cubo(80, height / 2);
    this.PConst = 3;
    this.IConst = 0;
    this.DConst = 1;
    this.sum = 0;
    this.lastError = 0;
    //this.car.showRays = true;
    //this.car.showVelVector = true;
  }

  run() {
    this.car.setThrottle(map(this.car.lidar.output[0], 0, 100, 0, 1));
    let error = this.car.lidar.output[1] - this.car.lidar.output[11] + this.car.lidar.output[2] - this.car.lidar.output[10];
    error = map(error, 0, 100, 0, 1);
    //console.log(error);
    this.sum += error;

    let dTerm = (error - this.lastError) * this.DConst;
    let pTerm = error * this.PConst;
    let iTerm = this.sum * this.IConst;

    this.lastError = error;

    let turnCalc = dTerm + pTerm + iTerm;
    //console.log(pTerm);
    this.car.rotate(turnCalc);
  }
}
