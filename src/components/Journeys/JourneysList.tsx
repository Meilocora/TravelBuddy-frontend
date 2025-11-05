import { ReactElement, useContext, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Icons, StageFilter } from '../../models';
import JourneyListElement from './JourneysListElement';
import { validateIsOver } from '../../utils';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { deleteJourney } from '../../utils/http';
import Modal from '../UI/Modal';
import { StagesContext } from '../../store/stages-context';
import { GlobalStyles } from '../../constants/styles';

const JourneysList: React.FC = ({}): ReactElement => {
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [deleteJourneyId, setDeleteJourneyId] = useState<number | null>(null);

  const stagesCtx = useContext(StagesContext);

  const shownJourneys = stagesCtx.journeys.filter((journey) => {
    if (filter === StageFilter.current) {
      return !validateIsOver(journey.scheduled_end_time); // Only include journeys that haven't ended
    }
    return true; // Include all journeys for other filters
  });

  function handleSetFilter(filter: StageFilter) {
    setFilter(filter);
    setOpenModal(false);
  }

  function handlePressDelete(journeyId: number) {
    setOpenDeleteModal(true);
    setDeleteJourneyId(journeyId);
  }

  function closeDeleteModal() {
    setOpenDeleteModal(false);
    setDeleteJourneyId(null);
  }

  async function handleDelete() {
    const { error, status } = await deleteJourney(deleteJourneyId!);
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
          content={`The Journey and all it's Major and Minor Stages will be deleted permanently!`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
      <View style={styles.buttonContainer}>
        <IconButton
          icon={Icons.settings}
          onPress={() => setOpenModal(!openModal)}
          color={GlobalStyles.colors.grayDark}
        />
      </View>
      {openModal && (
        <FilterSettings filter={filter} setFilter={handleSetFilter} />
      )}
      <FlatList
        data={shownJourneys}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 200).duration(1000)}
            exiting={FadeOutDown}
          >
            <JourneyListElement journey={item} onDelete={handlePressDelete} />
            {index === shownJourneys.length - 1 && (
              <View style={{ height: 75 }}></View>
            )}
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

export default JourneysList;
