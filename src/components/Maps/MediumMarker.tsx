import { ReactElement, useEffect, useRef, useState } from 'react';
import { LatLng, MapMarker, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import { Icons, MediumLocation } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';

const HEIGHT = 52;
const WIDTH = 52;

interface MediumMarkerProps {
  mediumLocation: MediumLocation;
  onPressMarker: (location: MediumLocation) => void;
  active?: boolean;
  coordinate?: LatLng; // only needed for clustering
}

const MediumMarker: React.FC<MediumMarkerProps> = ({
  mediumLocation,
  onPressMarker,
  active,
  coordinate,
}): ReactElement => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const markerRef = useRef<MapMarker>(null);

  const { mediumType, description, favourite, latitude, longitude, url } =
    mediumLocation;

  function handlePressMarker() {
    onPressMarker?.(mediumLocation);
  }

  function handleMediumError() {
    setTracksViewChanges(false);
  }

  useEffect(() => {
    const t = setTimeout(() => setTracksViewChanges(false), 1000);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <Marker
      ref={markerRef}
      tracksViewChanges={tracksViewChanges}
      coordinate={{
        latitude,
        longitude,
      }}
      description={description}
      onPress={handlePressMarker}
    >
      <View style={styles.photoWrap}>
        <ExpoImage
          source={{ uri: url }}
          style={styles.photo}
          contentFit='cover'
          transition={150}
          onError={handleMediumError}
          cachePolicy='memory-disk'
        />
        {mediumType === 'video' && (
          <IconButton
            icon={Icons.play}
            onPress={() => {}}
            color={GlobalStyles.colors.graySoftSemi}
            style={styles.playIcon}
          />
        )}
        <View
          style={[
            styles.ring,
            active ? styles.ringActive : favourite ? styles.ringFav : undefined,
          ]}
        />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  photoWrap: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: GlobalStyles.colors.graySoft, // Platzhalter-Hintergrund
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  ring: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.graySoft,
  },
  ringActive: {
    borderColor: 'gold',
  },
  ringFav: {
    borderColor: GlobalStyles.colors.favorite,
  },
  playIcon: {
    position: 'absolute',
  },
});

export default MediumMarker;
