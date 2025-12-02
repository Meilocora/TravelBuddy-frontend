import { ReactElement } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { Image as ImageType } from '../../models/image';

interface ImageListElementProps {
  image: ImageType;
}

const ImageListElement: React.FC<ImageListElementProps> = ({
  image,
}): ReactElement => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image.url }}
        resizeMode='cover'
        style={styles.image}
      />
    </View>
  );
};

// TODO: onPress => größer öffnen inkl. allen Daten + Button zum löschen, bearbeiten, auf Karte ansehen, zur stage springen

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1, // Quadratisch
    padding: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageListElement;
