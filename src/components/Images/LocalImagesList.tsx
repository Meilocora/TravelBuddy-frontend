import { ReactElement, useContext } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ImageContext } from '../../store/image-context';
import ImageListElement from './ImageListElement';
import { Image } from '../../models/image';
import { PlaceContext } from '../../store/place-context';
import { GlobalStyles } from '../../constants/styles';
import Button from '../UI/Button';
import { ButtonMode, ColorScheme } from '../../models';

interface LocalImagesListProps {
  visible: boolean;
  handleClose: () => void;
  countryId?: number;
  minorStageId?: number;
  minorStageIds?: number[];
  placeId?: number;
}

const LocalImagesList: React.FC<LocalImagesListProps> = ({
  visible,
  handleClose,
  countryId,
  minorStageId,
  minorStageIds,
  placeId,
}): ReactElement => {
  const imageCtx = useContext(ImageContext);
  const placeCtx = useContext(PlaceContext);

  const { width, height } = useWindowDimensions();

  let images: Image[] | undefined = [];
  if (countryId) {
    const places = placeCtx.getPlacesByCountry(countryId);
    const placeIds = places.map((p) => p.id);
    images = imageCtx.images.filter(
      (img) => img.placeToVisitId && placeIds.includes(img.placeToVisitId)
    );
  } else if (minorStageId) {
    images = imageCtx.images.filter((img) => img.minorStageId === minorStageId);
  } else if (minorStageIds) {
    images = imageCtx.images.filter(
      (img) => img.minorStageId && minorStageIds.includes(img.minorStageId)
    );
  } else if (placeId) {
    images = imageCtx.images.filter((img) => img.placeToVisitId === placeId);
  }

  if (!images) {
    return <View></View>;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.container,
            { height: height * 0.85, width: width * 0.95 },
          ]}
        >
          <FlatList
            data={images}
            numColumns={3}
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
          <View style={styles.separator} />
          <Button
            colorScheme={ColorScheme.neutral}
            onPress={handleClose}
            style={styles.dismissButton}
            mode={ButtonMode.flat}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: GlobalStyles.colors.graySoft,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  list: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  separator: {
    borderTopWidth: 1,
    marginHorizontal: 10,
  },
  dismissButton: {
    marginHorizontal: 'auto',
  },
});

export default LocalImagesList;
