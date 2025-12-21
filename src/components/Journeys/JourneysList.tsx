import { ReactElement, useContext, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControlProps } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Icons, StageFilter } from '../../models';
import JourneyListElement from './JourneysListElement';
import { validateIsOver } from '../../utils';
import IconButton from '../UI/IconButton';
import FilterSettings from '../UI/FilterSettings';
import { StagesContext } from '../../store/stages-context';
import { GlobalStyles } from '../../constants/styles';

interface JourneysListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const JourneysList: React.FC<JourneysListProps> = ({
  refreshControl,
}): ReactElement => {
  const [filter, setFilter] = useState<StageFilter>(StageFilter.current);
  const [openModal, setOpenModal] = useState<boolean>(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <IconButton
          icon={openModal ? Icons.settingsFilled : Icons.settingsOutline}
          onPress={() => setOpenModal(!openModal)}
          color={GlobalStyles.colors.grayDark}
        />
      </View>
      {openModal && (
        <FilterSettings filter={filter} setFilter={handleSetFilter} />
      )}
      <FlatList
        data={shownJourneys}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={refreshControl}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 200).duration(1000)}
            exiting={FadeOutDown}
          >
            <JourneyListElement journey={item} />
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
