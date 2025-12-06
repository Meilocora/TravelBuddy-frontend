import { ReactElement, useEffect, useRef, useState } from 'react';
import { LatLng, MapMarker, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import { ImageLocation } from '../../models';
import { GlobalStyles } from '../../constants/styles';

const HEIGHT = 64;
const WIDTH = 64;

interface ImageMarkerProps {
  imageLocation: ImageLocation;
  onPressMarker: (location: ImageLocation) => void;
  active?: boolean;
  coordinate?: LatLng;
}

const ImageMarker: React.FC<ImageMarkerProps> = ({
  imageLocation,
  onPressMarker,
  active,
  coordinate,
}): ReactElement => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const markerRef = useRef<MapMarker>(null);

  const { description, favourite, latitude, longitude, url } = imageLocation;

  function handlePressMarker() {
    onPressMarker?.(imageLocation);
  }

  function handleImageError() {
    setTracksViewChanges(false);
  }

  useEffect(() => {
    // kurze Verzögerung reicht meistens; noch besser: auf onLoad/onError des Bildes hören (unten)
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
          // sanftes Einblenden
          transition={150}
          // Bild geladen → ViewChanges aus (Android Performance)
          onError={handleImageError}
          cachePolicy='memory-disk'
        />
        {/* optionaler, dünner Border-Ring für bessere Lesbarkeit */}
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
    borderRadius: WIDTH / 2,
    overflow: 'hidden',
    backgroundColor: GlobalStyles.colors.graySoft, // Platzhalter-Hintergrund
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: WIDTH / 2 + 1,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.graySoft,
  },
  ringActive: {
    borderColor: 'gold',
  },
  ringFav: {
    borderColor: GlobalStyles.colors.favorite,
  },
});

export default ImageMarker;
