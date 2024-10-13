// dailywave.tsx
export const fetchWaveHeights = async () => {
    try {
      const response = await fetch(
        "https://marine-api.open-meteo.com/v1/marine?latitude=7.0731&longitude=125.6128&daily=wave_height_max"
      );
      const data = await response.json();
      
      console.log(data);
  
      const heights = data.daily.wave_height_max;
      const times = data.daily.time;
  
      return { heights, times };
    } catch (error) {
      console.error("Error fetching daily wave heights:", error);
      throw error;
    }
  };