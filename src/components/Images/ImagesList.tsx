import { ReactElement, useContext, useMemo, useState } from 'react';
import {
  RefreshControlProps,
  SectionList,
  SectionListData,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ImageContext } from '../../store/image-context';
import { PlaceContext } from '../../store/place-context';
import ImageListElement from './ImageListElement';
import { Image } from '../../models/media';
import { Icons } from '../../models';
import IconButton from '../UI/IconButton';
import { GlobalStyles } from '../../constants/styles';
import ImagesListFilters from './ImageListFilters';
import { parseDateAndTime } from '../../utils';

interface ImagesListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onDelete: (image: Image) => void;
}

// Eine Zeile in der Galerie: bis zu 3 Bilder
type ImageRow = Image[];

interface ImageMonthSection {
  title: string; // "Januar 2025"
  data: ImageRow[];
}

const ImagesList: React.FC<ImagesListProps> = ({
  refreshControl,
  onDelete,
}): ReactElement => {
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
  >('all'); // TODO: aktuell noch ungenutzt

  const imageCtx = useContext(ImageContext);
  const placeCtx = useContext(PlaceContext);

  function handleTapSort() {
    setSortDate((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  // -------- 1) Filter & Sort wie bisher --------
  let images = [...imageCtx.images];

  // Sortierung nach Datum
  images.sort((a, b) => {
    const da = parseDateAndTime(a.timestamp).getTime();
    const db = parseDateAndTime(b.timestamp).getTime();
    return sortDate === 'desc' ? db - da : da - db;
  });

  // Favoriten-Filter
  if (filterFav) {
    images = images.filter((img) => img.favorite === true);
  }
  // Place-Filter
  if (filterPlace) {
    images = images.filter((img) => img.placeToVisitId === filterPlace);
  }
  // MinorStage-Filter
  if (filterMinorStage) {
    images = images.filter((img) => img.minorStageId === filterMinorStage);
  }
  // Country-Filter
  if (filterCountry) {
    const places = placeCtx.getPlacesByCountry(filterCountry);
    const placeIds = places.map((p) => p.id);
    images = images.filter(
      (img) => img.placeToVisitId && placeIds.includes(img.placeToVisitId)
    );
  }

  const globalIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    images.forEach((img, idx) => {
      map.set(img.id, idx);
    });
    return map;
  }, [images]);

  // -------- 2) Gruppierung nach Monat -> Sections --------

  const sections: ImageMonthSection[] = useMemo(() => {
    // Map: monthKey -> { title, images[] }
    const monthMap = new Map<string, { title: string; images: Image[] }>();

    for (const img of images) {
      const date = parseDateAndTime(img.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // z.B. "2025-0"

      const monthLabel = date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
      }); // "Januar 2025"

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { title: monthLabel, images: [] });
      }
      monthMap.get(monthKey)!.images.push(img);
    }

    // Hilfsfunktion: Images in 3er-Reihen aufteilen
    const chunkIntoRows = (arr: Image[], size: number = 3): ImageRow[] => {
      const rows: ImageRow[] = [];
      for (let i = 0; i < arr.length; i += size) {
        rows.push(arr.slice(i, i + size));
      }
      return rows;
    };

    const result: ImageMonthSection[] = [];

    // Map behält Insertion-Order basierend auf sortierten images
    monthMap.forEach((value) => {
      result.push({
        title: value.title,
        data: chunkIntoRows(value.images, 3),
      });
    });

    return result;
  }, [images]);

  return (
    <View style={styles.container}>
      {/* Buttons: Sort, Filter, Fav */}
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

      {/* -------- 3) SectionList mit Monats-Trennern & 3er-Grid -------- */}
      <SectionList
        sections={sections}
        refreshControl={refreshControl}
        keyExtractor={(row, index) => {
          // row ist hier ImageRow (Array von Images)
          const firstId = row[0]?.id ?? `row-${index}`;
          return `${firstId}-${index}`;
        }}
        contentContainerStyle={styles.list}
        ListFooterComponent={<View style={{ height: 75 }} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.monthHeader}>
            <View style={styles.monthLine} />
            <View style={styles.monthLabelContainer}>
              <Text style={styles.monthText}>{section.title}</Text>
            </View>
            <View style={styles.monthLine} />
          </View>
        )}
        renderItem={({
          item: row,
          index: rowIndex,
          section,
        }: {
          item: ImageRow;
          index: number;
          section: SectionListData<ImageRow, ImageMonthSection>;
        }) => {
          // row = bis zu 3 Bilder (eine Zeile)
          return (
            <View style={styles.row}>
              {row.map((img, colIndex) => {
                // für Animation: "Pseudo-Gesamtindex"
                const globalIndex = globalIndexMap.get(img.id) ?? 0;
                const animationIndex = rowIndex * 3 + colIndex;
                return (
                  <Animated.View
                    key={img.id.toString()}
                    entering={FadeInDown.delay(animationIndex * 50).duration(
                      500
                    )}
                    exiting={FadeOutDown}
                    style={styles.itemContainer}
                  >
                    <ImageListElement
                      image={img}
                      index={globalIndex}
                      images={images.length > 1 ? images : undefined}
                      onDelete={onDelete}
                    />
                  </Animated.View>
                );
              })}
            </View>
          );
        }}
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
  // Eine Zeile mit bis zu 3 Items
  row: {
    flexDirection: 'row',
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  // Monatsheader (Trenner)
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: GlobalStyles.colors.grayMedium,
    opacity: 0.4,
  },
  monthLabelContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.graySoft + '22', // leichter Tint
  },
  monthText: {
    fontSize: 12,
    color: GlobalStyles.colors.grayDark,
  },
});

export default ImagesList;
