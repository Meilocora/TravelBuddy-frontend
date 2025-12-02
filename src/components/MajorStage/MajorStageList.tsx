import { ReactElement, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import MajorStageListElement from './MajorStageListElement';
import InfoCurtain from '../UI/InfoCurtain';
import {
  ColorScheme,
  Icons,
  Journey,
  MajorStage,
  StageFilter,
  StagesPositionDict,
} from '../../models';
import { validateIsOver } from '../../utils';
import { swapMajorStages } from '../../utils/http';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GlobalStyles } from '../../constants/styles';
import ErrorOverlay from '../UI/ErrorOverlay';
import { useAppData } from '../../hooks/useAppData';

interface MajorStageListProps {
  journey: Journey;
  majorStages: MajorStage[];
}

const MajorStageList: React.FC<MajorStageListProps> = ({
  journey,
  majorStages,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { triggerRefresh } = useAppData();

  const shownMajorStages = majorStages.filter((majorStage) => {
    if (filter === StageFilter.current) {
      return !validateIsOver(majorStage.scheduled_end_time); // Only include major stages that haven't ended
    }
    return true; // Include all major stages for other filters
  });

  function handleSetFilter(filter: StageFilter) {
    setFilter(filter);
    setOpenModal(false);
  }

  async function handleSwitchElements(data: MajorStage[]) {
    const stagesPositionList: StagesPositionDict[] = [];
    data.forEach((stage, index) => {
      stagesPositionList.push({ id: stage.id, position: index + 1 });
    });

    const { status, error } = await swapMajorStages(stagesPositionList);
    if (error) {
      return setError(error);
    } else {
      triggerRefresh();
    }
  }

  return (
    <View style={styles.container}>
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <View style={styles.buttonContainer}>
        <IconButton
          icon={openModal ? Icons.settingsFilled : Icons.settingsOutline}
          onPress={() => setOpenModal((prevValue) => !prevValue)}
          color={GlobalStyles.colors.grayMedium}
        />
      </View>
      {openModal && (
        <FilterSettings
          filter={filter}
          setFilter={handleSetFilter}
          colorScheme={ColorScheme.accent}
        />
      )}
      {journey?.description && (
        <InfoCurtain
          info={journey?.description}
          colorScheme={ColorScheme.accent}
        />
      )}
      <DraggableFlatList
        data={shownMajorStages}
        keyExtractor={(item) => item.id.toString()}
        removeClippedSubviews={false}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const index = getIndex?.() ?? 0;
          return (
            <>
              <Animated.View
                entering={FadeInDown.delay(index * 200).duration(500)}
              >
                <MajorStageListElement
                  onLongPress={drag}
                  journeyId={journey.id}
                  majorStage={item}
                  isActive={isActive}
                />
              </Animated.View>
              {index !== shownMajorStages.length - 1 && (
                <View style={styles.separatorContainer}>
                  <View style={styles.seperator}></View>
                  <View style={styles.arrowDown} />
                </View>
              )}
              {index === shownMajorStages.length - 1 && (
                <View style={{ height: 75 }}></View>
              )}
            </>
          );
        }}
        onDragEnd={({ data }) => {
          handleSwitchElements(data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorContainer: {
    marginVertical: 4,
  },
  seperator: {
    width: '50.3%',
    height: 22,
    alignSelf: 'flex-start',
    borderRightWidth: 2,
    borderColor: GlobalStyles.colors.grayDark,
  },
  arrowDown: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GlobalStyles.colors.grayDark,
  },
});

export default MajorStageList;
