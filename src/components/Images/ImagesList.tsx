import { ReactElement, useContext, useState } from 'react';
import { FlatList, RefreshControlProps, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ImageContext } from '../../store/image-context';
import ImageListElement from './ImageListElement';
import { Image } from '../../models/image';
import { Icons } from '../../models';
import IconButton from '../UI/IconButton';
import { GlobalStyles } from '../../constants/styles';
import ImagesListFilters from './ImageListFilters';
import { parseDateAndTime } from '../../utils';
import { PlaceContext } from '../../store/place-context';

interface ImagesListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onDelete: (image: Image) => void;
}

const ImagesList: React.FC<ImagesListProps> = ({
  refreshControl,
  onDelete,
}): ReactElement => {
  // TODO: longPress => mehrere images markieren + löschen oder zu minorStage bzw. PlaceToVisit zuordnen

  const [showFilters, setShowFilters] = useState(false);
  const [sortDate, setSortDate] = useState<'asc' | 'desc'>('asc');
  const [filterFav, setFilterFav] = useState(false);
  const [filterPlace, setFilterPlace] = useState<number | undefined>();
  const [filterCountry, setFilterCountry] = useState<number | undefined>();
  const [filterMinorStage, setFilterMinorStage] = useState<
    number | undefined
  >();
  const [filterTimespan, setFilterTimespan] = useState<
    'all' | 'one_year' | 'custom'
  >();

  const imageCtx = useContext(ImageContext);
  const placeCtx = useContext(PlaceContext);

  function handleTapSort() {
    if (sortDate === 'asc') {
      setSortDate('desc');
    } else {
      setSortDate('asc');
    }
  }

  let images = imageCtx.images;

  if (sortDate === 'desc') {
    images = images.sort(
      (a, b) =>
        parseDateAndTime(b.timestamp).getTime() -
        parseDateAndTime(a.timestamp).getTime()
    );
  } else {
    images = images.sort(
      (a, b) =>
        parseDateAndTime(a.timestamp).getTime() -
        parseDateAndTime(b.timestamp).getTime()
    );
  }

  if (filterFav) {
    images = images.filter((img) => img.favorite === true);
  }
  if (filterPlace) {
    images = images.filter((img) => img.placeToVisitId === filterPlace);
  }
  if (filterMinorStage) {
    images = images.filter((img) => img.minorStageId === filterMinorStage);
  }
  if (filterCountry) {
    const places = placeCtx.getPlacesByCountry(filterCountry);
    const placeIds = places.map((p) => p.id);
    images = images.filter(
      (img) => img.placeToVisitId && placeIds.includes(img.placeToVisitId)
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <IconButton
          icon={Icons.filter}
          onPress={handleTapSort}
          color={GlobalStyles.colors.grayDark}
          style={
            sortDate === 'desc'
              ? { transform: [{ rotate: '180deg' }] }
              : undefined
          }
        />
        <IconButton
          icon={showFilters ? Icons.settingsFilled : Icons.settingsOutline}
          onPress={() => setShowFilters((prevValue) => !prevValue)}
          color={GlobalStyles.colors.grayDark}
        />
        <IconButton
          icon={filterFav ? Icons.heartFilled : Icons.heartOutline}
          onPress={() => setFilterFav((prevValue) => !prevValue)}
          color={
            filterFav
              ? GlobalStyles.colors.favorite
              : GlobalStyles.colors.grayDark
          }
        />
      </View>
      {showFilters && (
        <ImagesListFilters
          filterMinorStage={filterMinorStage}
          setFilterMinorStage={setFilterMinorStage}
          filterPlace={filterPlace}
          setFilterPlace={setFilterPlace}
          onClose={() => setShowFilters(false)}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
        />
      )}
      {/* TODO: Trenner zwischen Monaten einfügen */}
      <FlatList
        data={images}
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ImagesList;
