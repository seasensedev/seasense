interface Tensor {
  shape: number[];
  values: number[];
}

interface Layer {
  units: number;
  activation?: 'relu' | 'sigmoid';
  inputShape?: number[];
}

export class NeuralNetwork {
  private layers: Layer[];
  private weights: Tensor[];
  private compiled: boolean;
  private optimizer: string;
  private loss: string;

  constructor() {
    this.layers = [];
    this.weights = [];
    this.compiled = false;
    this.optimizer = '';
    this.loss = '';
  }

  add(layer: Layer) {
    this.layers.push(layer);
  }

  compile(config: { optimizer: string; loss: string }) {
    this.optimizer = config.optimizer;
    this.loss = config.loss;
    this.compiled = true;

    for (let i = 1; i < this.layers.length; i++) {
      const inputDim = this.layers[i-1].units;
      const outputDim = this.layers[i].units;
      
      this.weights.push({
        shape: [inputDim, outputDim],
        values: Array(inputDim * outputDim).fill(0).map(() => Math.random() - 0.5)
      });
    }
  }

  private activation(x: number, type?: string): number {
    switch(type) {
      case 'relu':
        return Math.max(0, x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      default:
        return x;
    }
  }

  async predict(inputs: number[]): Promise<number[]> {
    if (!this.compiled) {
      throw new Error('Model must be compiled before prediction');
    }

    let current = inputs;
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const weights = this.weights[i-1];
      
      const output = new Array(layer.units).fill(0);
      for (let j = 0; j < layer.units; j++) {
        for (let k = 0; k < current.length; k++) {
          output[j] += current[k] * weights.values[k * layer.units + j];
        }
        output[j] = this.activation(output[j], layer.activation);
      }
      current = output;
    }

    return current;
  }

  async fit(
    inputs: number[][],
    outputs: number[][],
    config: { epochs: number; batchSize?: number }
  ): Promise<void> {
    if (!this.compiled) {
      throw new Error('Model must be compiled before training');
    }

    for (let epoch = 0; epoch < config.epochs; epoch++) {
      for (let i = 0; i < inputs.length; i++) {
        await this.predict(inputs[i]); 
      }
    }
  }
}
