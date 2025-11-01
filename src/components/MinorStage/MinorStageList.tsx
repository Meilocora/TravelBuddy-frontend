import { ReactElement, useContext, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import MinorStageListElement from './MinorStageListElement';
import { generateRandomString } from '../../utils/generator';
import InfoCurtain from '../UI/InfoCurtain';
import {
  ColorScheme,
  Icons,
  MajorStage,
  MinorStage,
  StageFilter,
} from '../../models';
import { deleteMinorStage, validateIsOver } from '../../utils';
import Modal from '../UI/Modal';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { StagesContext } from '../../store/stages-context';

interface MinorStageListProps {
  majorStage: MajorStage;
  minorStages: MinorStage[];
}

const MinorStageList: React.FC<MinorStageListProps> = ({
  majorStage,
  minorStages,
}): ReactElement => {
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);
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

  function handlePressDelete(minorStageId: number) {
    setOpenDeleteModal(true);
    setDeleteMinorStageId(minorStageId);
  }

  function closeDeleteModal() {
    setOpenDeleteModal(false);
    setDeleteMinorStageId(null);
  }

  async function handleDelete() {
    const { error, status } = await deleteMinorStage(deleteMinorStageId!);
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
          content={`The Minor Stage will be deleted permanently!`}
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
      {majorStage?.additional_info && (
        <InfoCurtain
          info={majorStage?.additional_info}
          colorScheme={ColorScheme.complementary}
        />
      )}
      <FlatList
        scrollEnabled
        nestedScrollEnabled
        style={styles.listContainer}
        data={shownMinorStages}
        renderItem={({ item }) => (
          <MinorStageListElement
            key={generateRandomString()}
            minorStage={item}
            onDelete={handlePressDelete}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
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
});

export default MinorStageList;
