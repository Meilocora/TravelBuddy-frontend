import { ReactElement, useContext, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import MajorStageListElement from './MajorStageListElement';
import InfoCurtain from '../UI/InfoCurtain';
import {
  ColorScheme,
  Icons,
  Journey,
  MajorStage,
  StageFilter,
} from '../../models';
import { parseDate } from '../../utils';
import { deleteMajorStage } from '../../utils/http';
import Modal from '../UI/Modal';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { StagesContext } from '../../store/stages-context';

interface MajorStageListProps {
  journey: Journey;
  majorStages: MajorStage[];
}

const MajorStageList: React.FC<MajorStageListProps> = ({
  journey,
  majorStages,
}): ReactElement => {
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deleteMajorStageId, setDeleteMajorStageId] = useState<number | null>(
    null
  );

  const stagesCtx = useContext(StagesContext);
  const now = new Date();
  const shownMajorStages = majorStages.filter((majorStage) => {
    if (filter === StageFilter.current) {
      return parseDate(majorStage.scheduled_end_time) >= now; // Only include major stages that haven't ended
    }
    return true; // Include all major stages for other filters
  });

  function handleSetFilter(filter: StageFilter) {
    setFilter(filter);
    setOpenModal(false);
  }

  function handlePressDelete(majorStageId: number) {
    setOpenDeleteModal(true);
    setDeleteMajorStageId(majorStageId);
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

  return (
    <View style={styles.container}>
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
        />
      </View>
      {openModal && (
        <FilterSettings filter={filter} setFilter={handleSetFilter} />
      )}
      {journey?.description && (
        <InfoCurtain
          info={journey?.description}
          colorScheme={ColorScheme.accent}
        />
      )}
      <FlatList
        data={shownMajorStages}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 200).duration(500)}>
            <MajorStageListElement
              journeyId={journey.id}
              majorStage={item}
              index={index}
              onDelete={handlePressDelete}
            />
          </Animated.View>
        )}
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
});

export default MajorStageList;
