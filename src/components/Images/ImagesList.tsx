import { ReactElement, useContext } from 'react';
import { FlatList, RefreshControlProps, StyleSheet, View } from 'react-native';
import { ImageContext } from '../../store/image-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import ImageListElement from './ImageListElement';
import { Image } from '../../models/image';

interface ImagesListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onDelete: (image: Image) => void;
}

const ImagesList: React.FC<ImagesListProps> = ({
  refreshControl,
  onDelete,
}): ReactElement => {
  const imageCtx = useContext(ImageContext);
  return (
    <View style={styles.container}>
      <FlatList
        data={imageCtx.images}
        refreshControl={refreshControl}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100).duration(500)}
            exiting={FadeOutDown}
            style={styles.itemContainer}
          >
            <ImageListElement image={item} onDelete={onDelete} />
            {index === imageCtx.images.length - 1 && (
              <View style={{ height: 75 }}></View>
            )}
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
});

export default ImagesList;
