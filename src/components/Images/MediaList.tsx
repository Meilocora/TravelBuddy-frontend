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

import { MediumContext } from '../../store/medium-context';
import { PlaceContext } from '../../store/place-context';
import { Medium } from '../../models/media';
import { Icons } from '../../models';
import IconButton from '../UI/IconButton';
import { GlobalStyles } from '../../constants/styles';
import { parseDateAndTime } from '../../utils';
import MediaListFilters from './MediaListFilters';
import MediaListElement from './MediaListElement';

interface MediaListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onDelete: (medium: Medium) => void;
}

// Eine Zeile in der Galerie: bis zu 3 Bilder
type MediaRow = Medium[];

interface MediaMonthSection {
  title: string; // "Januar 2025"
  data: MediaRow[];
}

const MediaList: React.FC<MediaListProps> = ({
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

  const mediumCtx = useContext(MediumContext);
  const placeCtx = useContext(PlaceContext);

  function handleTapSort() {
    setSortDate((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  // -------- 1) Filter & Sort wie bisher --------
  let media = [...mediumCtx.media];

  // Sortierung nach Datum
  media.sort((a, b) => {
    const da = parseDateAndTime(a.timestamp).getTime();
    const db = parseDateAndTime(b.timestamp).getTime();
    return sortDate === 'desc' ? db - da : da - db;
  });

  // Favoriten-Filter
  if (filterFav) {
    media = media.filter((m) => m.favorite === true);
  }
  // Place-Filter
  if (filterPlace) {
    media = media.filter((m) => m.placeToVisitId === filterPlace);
  }
  // MinorStage-Filter
  if (filterMinorStage) {
    media = media.filter((m) => m.minorStageId === filterMinorStage);
  }
  // Country-Filter
  if (filterCountry) {
    const places = placeCtx.getPlacesByCountry(filterCountry);
    const placeIds = places.map((p) => p.id);
    media = media.filter(
      (m) => m.placeToVisitId && placeIds.includes(m.placeToVisitId)
    );
  }

  const globalIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    media.forEach((m, idx) => {
      map.set(m.id, idx);
    });
    return map;
  }, [media]);

  // -------- 2) Gruppierung nach Monat -> Sections --------

  const sections: MediaMonthSection[] = useMemo(() => {
    // Map: monthKey -> { title, media[] }
    const monthMap = new Map<string, { title: string; media: Medium[] }>();

    for (const m of media) {
      const date = parseDateAndTime(m.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // z.B. "2025-0"

      const monthLabel = date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
      }); // "Januar 2025"

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { title: monthLabel, media: [] });
      }
      monthMap.get(monthKey)!.media.push(m);
    }

    const chunkIntoRows = (arr: Medium[], size: number = 3): MediaRow[] => {
      const rows: MediaRow[] = [];
      for (let i = 0; i < arr.length; i += size) {
        rows.push(arr.slice(i, i + size));
      }
      return rows;
    };

    const result: MediaMonthSection[] = [];

    monthMap.forEach((value) => {
      result.push({
        title: value.title,
        data: chunkIntoRows(value.media, 3),
      });
    });

    return result;
  }, [media]);

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
        <MediaListFilters
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
          item: MediaRow;
          index: number;
          section: SectionListData<MediaRow, MediaMonthSection>;
        }) => {
          return (
            <View style={styles.row}>
              {row.map((m, colIndex) => {
                const globalIndex = globalIndexMap.get(m.id) ?? 0;
                const animationIndex = rowIndex * 3 + colIndex;
                return (
                  <Animated.View
                    key={m.id.toString()}
                    entering={FadeInDown.delay(animationIndex * 50).duration(
                      500
                    )}
                    exiting={FadeOutDown}
                    style={styles.itemContainer}
                  >
                    <MediaListElement
                      medium={m}
                      index={globalIndex}
                      media={media.length > 1 ? media : undefined}
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

export default MediaList;
