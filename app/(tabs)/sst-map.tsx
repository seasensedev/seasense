import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE, Region,MapPressEvent } from 'react-native-maps';
import { db } from '@/config/firebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';


const SSTMap = () => {
  type SSTData = {
    latitude: number;
    longitude: number;
    sst: number;
    time: string;
  };

  const [sst_data, setSSTData] = useState<SSTData[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 6.88,
    longitude: 125.64,
    latitudeDelta: 1.21,
    longitudeDelta: 0.90,
  });

  const fetchData = async () => {
    try{
      const response = await fetch('https://firebasestorage.googleapis.com/v0/b/geomapper-d2b26.appspot.com/o/sea_surface_temperature%2Fdavao_sea_surface_temperature_sep_10_2024.geojson?alt=media&token=7e82526a-5ea0-448e-ba1d-5cc99084f813');
      const geoJSONData = await response.json();

      const sstDataArray: SSTData[] = geoJSONData.features.map((feature: any) => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        sst: feature.properties.SST_data,
      }));

      setSSTData(sstDataArray);
    }catch(e){
      console.error('Error fetching GeoJSON data: ', e)
    }
  }

  const handlePress = (event: MapPressEvent) =>{
    const {coordinate} = event.nativeEvent;
    
    const foundData = sst_data.find(point => {
      const distance = Math.sqrt(
        Math.pow(point.latitude - coordinate.latitude, 2)+
        Math.pow(point.longitude - coordinate.longitude, 2)
      );
      return distance < 0.01
    });

    if(foundData){
      Alert.alert(
        'SST Data',
        `SST: ${foundData.sst} °C\nLocation: Lat: ${foundData.latitude}, Lon: ${foundData.longitude}`,
        [{text: 'OK'}]
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, []);


  // Replace with the actual URL or local file path for your tiles
  const tilesUrl = 'http://localhost:8080/';

  return (
    <View style={styles.container}>
      <MapView
        mapType='hybrid'
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Use Google Maps for better performance (optional)
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handlePress}
      >
        <UrlTile
          urlTemplate="http://192.168.137.1:8080/data/sst_davao_3/{z}/{x}/{y}.png" //          urlTemplate="http://192.168.254.104:8080/data/sst_davao_3/{z}/{x}/{y}.png"
          maximumZ={19} 
          minimumZ={1}
          flipY={false}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default SSTMap;

/**
 * 
 *         {sst_data.map((entry, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: entry.latitude,
              longitude: entry.longitude,
            }}
            title={`SST: ${entry.sst} K`}
            description={`Time: ${new Date(entry.time).toLocaleString()}`}
          />
        ))}
 */