import 'react-native-get-random-values';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactElement, useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import MapView, { Region } from 'react-native-maps';

import { StackParamList } from '../models';
import { GlobalStyles } from '../constants/styles';
import MapsMarker from '../components/Maps/MapsMarker';
import HeaderTitle from '../components/UI/HeaderTitle';

interface ShowMapProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ShowMap'>;
  route: RouteProp<StackParamList, 'ShowMap'>;
}

const ShowMap: React.FC<ShowMapProps> = ({
  navigation,
  route,
}): ReactElement => {
  const location = route.params.location;
  const region: Region = {
    latitude: location.data.latitude,
    longitude: location.data.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.04,
  };

  let headerstyle = { backgroundColor: GlobalStyles.colors.primary500 };
  if (route.params?.colorScheme === 'complementary') {
    headerstyle = { backgroundColor: GlobalStyles.colors.complementary700 };
  }
  if (route.params?.colorScheme === 'accent') {
    headerstyle = { backgroundColor: GlobalStyles.colors.accent700 };
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={'Map'} />,
      headerStyle: headerstyle,
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={region!}
        region={region}
        onPress={() => {}}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
      >
        <MapsMarker location={location} key={location.data.latitude} />
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

export default ShowMap;
