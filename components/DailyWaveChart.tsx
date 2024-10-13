import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const CustomLineChart = ({ dailyLabels, dailyWaveHeights }: { dailyLabels: string[], dailyWaveHeights: number[] }) => {
  const renderDotContent = ({ x, y, index }: { x: number, y: number, index: number }) => {
    return (
      <View
        key={index}
        style={{
          position: 'absolute',
          top: y - 20,
          left: x - 9,
        }}
      >
        <Text style={{ fontSize: 10, color: 'white' }}>
          {dailyWaveHeights[index]}
        </Text>
      </View>
    );
  };

  return (
    <LineChart
      data={{
        labels: dailyLabels.length > 0 ? dailyLabels : ['Fetching Data...'],
        datasets: [
          {
            data: dailyWaveHeights.length > 0 ? dailyWaveHeights : [0],
          },
        ],
      }}
      width={Dimensions.get('window').width - 32}
      height={200}
      yAxisLabel=""
      yAxisSuffix="m"
      yAxisInterval={1}
      
      chartConfig={{
        backgroundColor: '#4a90e2',
        backgroundGradientFrom: '#4a90e2',
        backgroundGradientTo: '#0e4483',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16, 
        },
        propsForDots: {
          r: '5',
          strokeWidth: '2',
          stroke: '#ffa726',
        },
        
      }}
      bezier
      style={{
        marginVertical: 6,
        borderRadius: 12,
        marginBottom: 16,
      }}
      renderDotContent={renderDotContent}
    />
  );
};

export default CustomLineChart;