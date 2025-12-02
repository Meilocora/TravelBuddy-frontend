import { ReactElement, useContext } from 'react';
import { FlatList, RefreshControlProps, StyleSheet, View } from 'react-native';
import { ImageContext } from '../../store/image-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import ImageListElement from './ImageListElement';

interface ImagesListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const ImagesList: React.FC<ImagesListProps> = ({
  refreshControl,
}): ReactElement => {
  const imageCtx = useContext(ImageContext);
  return (
    <View style={styles.container}>
      <FlatList
        data={imageCtx.images}
        refreshControl={refreshControl}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100).duration(500)}
            exiting={FadeOutDown}
            style={styles.itemContainer}
          >
            <ImageListElement image={item} />
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
    paddingHorizontal: 4,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
  },
});

export default ImagesList;
