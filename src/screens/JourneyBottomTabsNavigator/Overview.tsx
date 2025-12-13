import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import { StagesContext } from '../../store/stages-context';
import DesctipionElement from '../../components/Overview/DescriptionElement';
import OverviewDetails from '../../components/Overview/OverviewDetails';
import OverviewChart from '../../components/Overview/OverviewChart';
import Button from '../../components/UI/Button';
import { ColorScheme } from '../../models';
import { CheckLog, validateJourney } from '../../utils';
import CheckModal from '../../components/Overview/CheckModal';

interface OverviewProps {}

const Overview: React.FC<OverviewProps> = (): ReactElement => {
  const [checkLogs, setCheckLogs] = useState<CheckLog[] | undefined>();

  const stagesCtx = useContext(StagesContext);
  const journey = stagesCtx.findJourney(stagesCtx.selectedJourneyId!);

  function handleCheckPlanning() {
    setCheckLogs(validateJourney(journey!));
  }

  function deleteCheckLog(item: CheckLog) {
    setCheckLogs((prev) => prev?.filter((log) => log !== item));
  }

  function handleCloseModal() {
    setCheckLogs(undefined);
  }

  return (
    <ScrollView style={styles.root} nestedScrollEnabled>
      <CheckModal
        checkLogs={checkLogs!}
        visible={!!(checkLogs && checkLogs?.length > 0)}
        onClose={handleCloseModal}
        onTapItem={deleteCheckLog}
      />
      {journey?.description && (
        <DesctipionElement description={journey.description} />
      )}
      <OverviewDetails journey={journey!} />
      <OverviewChart journey={journey!} />
      <Button
        colorScheme={ColorScheme.accent}
        onPress={handleCheckPlanning}
        style={styles.button}
      >
        Validate Planning
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  button: {
    alignSelf: 'flex-start',
    marginHorizontal: 'auto',
    marginTop: 10,
  },
});

export default Overview;
