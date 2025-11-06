import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ReactElement, useEffect, useState } from 'react';

import {
  ColorScheme,
  Icons,
  MapLocation,
  StackParamList,
} from '../../../models';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconButton from '../IconButton';
import { GlobalStyles } from '../../../constants/styles';
import {
  getCurrentLocation,
  useLocationPermissions,
} from '../../../utils/location';

interface LocationPickerProps {
  pickedLocation?: MapLocation;
  onPickLocation: (location: MapLocation) => void;
  iconColor?: string;
  colorScheme?: ColorScheme;
  countryId?: number;
  majorStageId?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  pickedLocation,
  onPickLocation,
  iconColor,
  colorScheme = ColorScheme.primary,
  countryId,
  majorStageId,
}): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const { verifyPermissions } = useLocationPermissions();
  const [hasInitialLocation, setHasInitialLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pickedLocation) {
      setIsLoading(false);
      setHasInitialLocation(true);
    }
  }, [pickedLocation]);

  let iconStandardColor = GlobalStyles.colors.greenAccent;
  if (colorScheme === ColorScheme.complementary) {
    iconStandardColor = GlobalStyles.colors.purpleAccent;
  } else if (colorScheme === ColorScheme.accent) {
    iconStandardColor = GlobalStyles.colors.amberAccent;
  }

  async function pickOnMapHandler() {
    setIsLoading(true);
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    let latitude: number;
    let longitude: number;
    if (!pickedLocation) {
      const location = await getCurrentLocation();
      latitude = location.latitude!;
      longitude = location.longitude!;
    } else {
      latitude = pickedLocation.lat!;
      longitude = pickedLocation.lng!;
    }

    navigation.navigate('LocationPickMap', {
      initialTitle: pickedLocation?.title,
      initialLat: latitude,
      initialLng: longitude,
      onPickLocation: (location: MapLocation) => {
        onPickLocation(location);
      },
      onResetLocation: handleResetLocation,
      hasLocation: hasInitialLocation,
      colorScheme: colorScheme,
      customCountryId: countryId,
      majorStageId: majorStageId,
    });
    setIsLoading(false);
  }

  function handleResetLocation() {
    setHasInitialLocation(false);
    onPickLocation({ title: '', lat: undefined, lng: undefined });
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size='large' color={iconStandardColor} />
      ) : (
        <IconButton
          icon={hasInitialLocation ? Icons.map : Icons.mapFilled}
          onPress={pickOnMapHandler}
          size={32}
          containerStyle={
            hasInitialLocation ? styles.activeMapButton : styles.mapButton
          }
          color={
            iconColor
              ? iconColor
              : hasInitialLocation
              ? iconStandardColor
              : 'white'
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
    width: 60,
  },
  mapButton: {
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
  activeMapButton: {
    backgroundColor: GlobalStyles.colors.graySoft,
  },
});

export default LocationPicker;
