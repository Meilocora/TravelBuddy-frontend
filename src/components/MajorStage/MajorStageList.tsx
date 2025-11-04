import { ReactElement, useContext, useState } from 'react';
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
import { deleteMajorStage, swapMajorStages } from '../../utils/http';
import Modal from '../UI/Modal';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { StagesContext } from '../../store/stages-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GlobalStyles } from '../../constants/styles';
import ErrorOverlay from '../UI/ErrorOverlay';

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

  // TODO: This here needed? Deletion goes via the Form!
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deleteMajorStageId, setDeleteMajorStageId] = useState<number | null>(
    null
  );

  const stagesCtx = useContext(StagesContext);
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

  function closeDeleteModal() {
    setOpenDeleteModal(false);
    setDeleteMajorStageId(null);
  }

  async function handleDelete() {
    const { error, status } = await deleteMajorStage(deleteMajorStageId!);
    if (!error && status === 200) {
      stagesCtx.fetchStagesData();
    }
    setOpenDeleteModal(false);
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
      return stagesCtx.fetchStagesData();
    }
  }

  return (
    <View style={styles.container}>
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      {openDeleteModal && (
        <Modal
          title='Are you sure?'
          content={`The Major Stage and all it's Minor Stages will be deleted permanently!`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
      <View style={styles.buttonContainer}>
        <IconButton
          icon={Icons.settings}
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
        style={styles.listContainer}
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
  listContainer: {
    paddingBottom: 30,
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
