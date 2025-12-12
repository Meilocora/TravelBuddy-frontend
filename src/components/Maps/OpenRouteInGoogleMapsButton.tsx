import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { Linking } from 'react-native';

type LatLng = {
  latitude: number;
  longitude: number;
};

type Props = {
  startPoint: LatLng | null | undefined;
  routePoints: LatLng[] | null | undefined;
  label?: string;
};

const OpenRouteInGoogleMapsButton: React.FC<Props> = ({
  startPoint,
  routePoints,
  label = 'Navigation in Google Maps starten',
}) => {
  const handlePress = () => {
    if (!startPoint) {
      Alert.alert(
        'Fehlende Startposition',
        'Es konnte keine Startposition ermittelt werden.'
      );
      return;
    }

    if (!routePoints || routePoints.length === 0) {
      Alert.alert('Keine Route', 'Es wurden keine Routenpunkte gefunden.');
      return;
    }

    const origin = `${startPoint.latitude},${startPoint.longitude}`;

    // Letzter routePoint als Ziel
    const lastPoint = routePoints[routePoints.length - 1];
    const destination = `${lastPoint.latitude},${lastPoint.longitude}`;

    // Alle bis auf den letzten als Wegpunkte
    const waypointsString = routePoints
      .slice(0, -1)
      .map((p) => `${p.latitude},${p.longitude}`)
      .join('|');

    let url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}`;

    if (waypointsString.length > 0) {
      url += `&waypoints=${encodeURIComponent(waypointsString)}`;
    }

    Linking.openURL(url).catch((err) => {
      console.warn('Fehler beim Öffnen von Google Maps URL:', err);
      Alert.alert(
        'Fehler',
        'Google Maps konnte nicht geöffnet werden. Ist eine Karten-App installiert?'
      );
    });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  button: {
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default OpenRouteInGoogleMapsButton;
