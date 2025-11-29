import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import MinorStageListElement from './MinorStageListElement';
import InfoCurtain from '../UI/InfoCurtain';
import {
  ColorScheme,
  Icons,
  MajorStage,
  MinorStage,
  StageFilter,
  StagesPositionDict,
} from '../../models';
import {
  deleteMinorStage,
  swapMinorStages,
  validateIsOver,
  validateOrders,
} from '../../utils';
import Modal from '../UI/Modal';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { StagesContext } from '../../store/stages-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { GlobalStyles } from '../../constants/styles';
import ErrorOverlay from '../UI/ErrorOverlay';

interface MinorStageListProps {
  majorStage: MajorStage;
  minorStages: MinorStage[];
}

const MinorStageList: React.FC<MinorStageListProps> = ({
  majorStage,
  minorStages,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);

  // TODO: This here needed? Deletion goes via the Form!
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deleteMinorStageId, setDeleteMinorStageId] = useState<number | null>(
    null
  );

  const stagesCtx = useContext(StagesContext);
  const shownMinorStages = minorStages.filter((minorStage) => {
    if (filter === StageFilter.current) {
      return !validateIsOver(minorStage.scheduled_end_time); // Only include major stages that haven't ended
    }
    return true; // Include all major stages for other filters
  });

  function handleSetFilter(filter: StageFilter) {
    setFilter(filter);
    setOpenModal(false);
  }

  function closeDeleteModal() {
    false;
    setDeleteMinorStageId(null);
  }

  async function handleDelete() {
    const { error, status } = await deleteMinorStage(deleteMinorStageId!);
    if (!error && status === 200) {
      stagesCtx.fetchStagesData();
    }
    setOpenDeleteModal(false);
  }

  async function handleSwitchElements(data: MinorStage[]) {
    const stagesPositionList: StagesPositionDict[] = [];
    const currentStagesPositionList: StagesPositionDict[] = [];
    data.forEach((stage, index) => {
      stagesPositionList.push({ id: stage.id, position: index + 1 });
    });
    minorStages.forEach((stage, index) => {
      currentStagesPositionList.push({ id: stage.id, position: index + 1 });
    });

    // When positions don't change, return ... otherwise every press will lead to a request for swap
    if (validateOrders(stagesPositionList, currentStagesPositionList)) {
      return;
    }

    const { status, error } = await swapMinorStages(stagesPositionList);
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
          content={`The Minor Stage will be deleted permanently!`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
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
          colorScheme={ColorScheme.complementary}
        />
      )}
      {majorStage?.additional_info && (
        <InfoCurtain
          info={majorStage?.additional_info}
          colorScheme={ColorScheme.complementary}
        />
      )}
      <DraggableFlatList
        data={shownMinorStages}
        nestedScrollEnabled
        keyExtractor={(item) => item.id.toString()}
        style={styles.listContainer}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const index = getIndex?.() ?? 0;
          return (
            <>
              <Animated.View
                entering={FadeInRight.delay(index * 200).duration(500)}
              >
                <MinorStageListElement
                  onLongPress={drag}
                  minorStage={item}
                  isActive={isActive}
                />
              </Animated.View>
              {index !== shownMinorStages.length - 1 && (
                <View style={styles.separatorContainer}>
                  <View style={styles.seperator}></View>
                  <View style={styles.arrowDown} />
                </View>
              )}
              {index === shownMinorStages.length - 1 && (
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
  listContainer: {
    width: '100%',
    marginHorizontal: 'auto',
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

export default MinorStageList;
