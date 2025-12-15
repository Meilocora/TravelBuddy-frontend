import { ReactElement, useContext } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { MediumContext } from '../../store/medium-context';
import { Medium } from '../../models/media';
import { PlaceContext } from '../../store/place-context';
import { GlobalStyles } from '../../constants/styles';
import Button from '../UI/Button';
import { ButtonMode, ColorScheme } from '../../models';
import MediaListElement from './MediaListElement';

interface LocalMediaListProps {
  visible: boolean;
  handleClose: () => void;
  countryId?: number;
  minorStageId?: number;
  minorStageIds?: number[];
  placeId?: number;
}

const LocalMediaList: React.FC<LocalMediaListProps> = ({
  visible,
  handleClose,
  countryId,
  minorStageId,
  minorStageIds,
  placeId,
}): ReactElement => {
  const mediumCtx = useContext(MediumContext);
  const placeCtx = useContext(PlaceContext);

  const { width, height } = useWindowDimensions();

  let media: Medium[] | undefined = [];
  if (countryId) {
    const places = placeCtx.getPlacesByCountry(countryId);
    const placeIds = places.map((p) => p.id);
    media = mediumCtx.media.filter(
      (m) => m.placeToVisitId && placeIds.includes(m.placeToVisitId)
    );
  } else if (minorStageId) {
    media = mediumCtx.media.filter((m) => m.minorStageId === minorStageId);
  } else if (minorStageIds) {
    media = mediumCtx.media.filter(
      (m) => m.minorStageId && minorStageIds.includes(m.minorStageId)
    );
  } else if (placeId) {
    media = mediumCtx.media.filter((m) => m.placeToVisitId === placeId);
  }

  if (!media) {
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
            data={media}
            numColumns={3}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 100).duration(500)}
                exiting={FadeOutDown}
                style={styles.itemContainer}
              >
                <MediaListElement
                  medium={item}
                  index={index}
                  media={media.length > 1 ? media : undefined}
                />
                {index === mediumCtx.media.length - 1 && (
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

export default LocalMediaList;
