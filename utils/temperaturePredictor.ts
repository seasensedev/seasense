export interface TemperaturePattern {
  time: number; 
  baseTemp: number;
  variance: number;
}

const dailyPatterns: TemperaturePattern[] = [
  { time: 6, baseTemp: 26, variance: 1 },   
  { time: 9, baseTemp: 27, variance: 1.5 }, 
  { time: 12, baseTemp: 29, variance: 2 }, 
  { time: 15, baseTemp: 30, variance: 1.5 }, 
  { time: 18, baseTemp: 28, variance: 1 },   
  { time: 21, baseTemp: 27, variance: 1 },  
  { time: 0, baseTemp: 26, variance: 0.5 }, 
  { time: 3, baseTemp: 25, variance: 0.5 }, 
];

export const predictTemperature = (
  currentTemp: number,
  hour: number = new Date().getHours()
): number => {
  const closestPattern = dailyPatterns.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.time - hour);
    const currDiff = Math.abs(curr.time - hour);
    return prevDiff < currDiff ? prev : curr;
  });

  const trend = (currentTemp - closestPattern.baseTemp) / closestPattern.variance;
  
  return Number((currentTemp + trend * closestPattern.variance * 0.5).toFixed(2));
};
