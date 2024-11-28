import { FishData } from '../models/fish_data';
import { NeuralNetwork } from '../models/neural_network';

interface FishScore {
  fish: FishData;
  score: number;
  confidence: number;
}

const TEMP_RANGE = { min: 20, max: 35 };
const LOCATION_RANGE = { min: -180, max: 180 };

export class FishPredictor {
  private network: NeuralNetwork;
  private trainingData: Map<string, number[]>;

  constructor() {
    this.network = new NeuralNetwork();
    this.network.add({ units: 4, inputShape: [4] }); 
    this.network.add({ units: 8, activation: 'relu' }); 
    this.network.add({ units: 1, activation: 'sigmoid' }); 
    
    this.network.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy'
    });

    this.trainingData = new Map();
  }

  private normalizeInputs(
    temperature: number,
    latitude: number,
    longitude: number,
    timeOfDay: number
  ): number[] {
    return [
      (temperature - TEMP_RANGE.min) / (TEMP_RANGE.max - TEMP_RANGE.min),
      (latitude - LOCATION_RANGE.min) / (LOCATION_RANGE.max - LOCATION_RANGE.min),
      (longitude - LOCATION_RANGE.min) / (LOCATION_RANGE.max - LOCATION_RANGE.min),
      timeOfDay / 24, 
    ];
  }

  private calculateEnvironmentalScore(
    fishTemp: number,
    currentTemp: number,
    fishLat?: number,
    fishLong?: number,
    currentLat?: number,
    currentLong?: number
  ): number {
    const tempDiff = Math.abs(fishTemp - currentTemp);
    const tempScore = Math.max(0, 1 - tempDiff / 5);

    let locationScore = 0.5; 
    if (fishLat && fishLong && currentLat && currentLong) {
      const distance = Math.sqrt(
        Math.pow(fishLat - currentLat, 2) + 
        Math.pow(fishLong - currentLong, 2)
      );
      locationScore = Math.max(0, 1 - distance / 0.5);
    }

    return tempScore * 0.7 + locationScore * 0.3;
  }

  async trainModel(historicalData: { fish: FishData; caught: boolean }[]): Promise<void> {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    historicalData.forEach(data => {
      const input = this.normalizeInputs(
        data.fish.temperature,
        data.fish.latitude || 0,
        data.fish.longitude || 0,
        new Date().getHours()
      );
      inputs.push(input);
      outputs.push([data.caught ? 1 : 0]);
      this.trainingData.set(data.fish.fish_name, input);
    });

    await this.network.fit(inputs, outputs, {
      epochs: 100,
      batchSize: 32
    });
  }

  async predict(
    fishes: FishData[],
    currentTemp: number,
    latitude: number,
    longitude: number
  ): Promise<FishScore[]> {
    const timeOfDay = new Date().getHours();
    const currentInputs = this.normalizeInputs(
      currentTemp,
      latitude,
      longitude,
      timeOfDay
    );

    const predictions = await Promise.all(
      fishes.map(async fish => {
        const fishInputs = this.normalizeInputs(
          fish.temperature,
          fish.latitude || latitude,
          fish.longitude || longitude,
          timeOfDay
        );
        const [nnScore] = await this.network.predict(fishInputs);

        const envScore = this.calculateEnvironmentalScore(
          fish.temperature,
          currentTemp,
          fish.latitude,
          fish.longitude,
          latitude,
          longitude
        );

        const finalScore = nnScore * 0.6 + envScore * 0.4;
        const confidence = Math.min(Math.max(finalScore * 100, 0), 100);

        return {
          fish,
          score: finalScore,
          confidence
        };
      })
    );

    return predictions
      .sort((a, b) => b.score - a.score)
      .filter(result => result.score > 0.3);
  }
}

export const fishPredictor = new FishPredictor();
