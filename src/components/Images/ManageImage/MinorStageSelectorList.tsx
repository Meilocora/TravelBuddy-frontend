import { ReactElement, useContext, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  Icons,
  Journey,
  MinorStage,
} from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../UI/IconButton';
import Search from '../../Locations/Search';
import { StagesContext } from '../../../store/stages-context';
import ListItem from '../../UI/search/ListItem';
import JourneySelector from './JourneySelector';

interface MinorStageSelectorListProps {
  visible: boolean;
  onCancel: () => void;
  onChangeMinorStage: (minorStageId: number | undefined) => void;
  defaultValue: MinorStage | '';
}

const MinorStageSelectorList: React.FC<MinorStageSelectorListProps> = ({
  visible,
  onCancel,
  onChangeMinorStage,
  defaultValue,
}): ReactElement => {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [journeyFilter, setJourneyFilter] = useState<undefined | Journey>();

  const stagesCtx = useContext(StagesContext);

  let minorStages: MinorStage[] | undefined = [];

  if (journeyFilter && journeyFilter.majorStages) {
    for (const majorStage of journeyFilter.majorStages) {
      if (!majorStage.minorStages) continue;
      minorStages = minorStages.concat(majorStage.minorStages);
    }
  } else {
    minorStages = stagesCtx.findAllMinorStages();
  }

  if (defaultValue) {
    minorStages = minorStages?.filter((stage) => stage.id !== defaultValue!.id);
  }

  if (minorStages) {
    if (sort === 'desc') {
      minorStages = minorStages.sort((a, b) => b.title.localeCompare(a.title));
    } else {
      minorStages = minorStages.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (searchTerm !== '') {
      minorStages = minorStages.filter((stage) =>
        stage.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  const stages = minorStages || [];

  function handleTapSort() {
    if (sort === 'asc') {
      setSort('desc');
    } else {
      setSort('asc');
    }
  }

  function handleTapSearch() {
    setSearch((prevValue) => !prevValue);
  }

  function handleTapJourneySelector(journey: Journey | undefined) {
    setJourneyFilter(journey);
  }

  function handlePressListElement(minorStage: MinorStage) {
    onChangeMinorStage(minorStage.id);
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.guestureContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>MinorStages</Text>
            </View>
            <View style={styles.iconButtonsContainer}>
              <IconButton
                icon={Icons.filter}
                onPress={handleTapSort}
                color={
                  sort === 'desc' ? GlobalStyles.colors.greenAccent : undefined
                }
                style={
                  sort === 'desc'
                    ? { transform: [{ rotate: '180deg' }] }
                    : undefined
                }
              />
              <IconButton
                icon={Icons.search}
                onPress={handleTapSearch}
                color={
                  search || searchTerm
                    ? GlobalStyles.colors.greenAccent
                    : undefined
                }
              />
              <JourneySelector
                onChangeJourney={handleTapJourneySelector}
                currentJourney={journeyFilter}
              />
            </View>
          </View>
          {search && (
            <View style={styles.searchContainer}>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </View>
          )}

          <ScrollView
            style={styles.listContainer}
            nestedScrollEnabled
            scrollEnabled
          >
            {stages &&
              stages.length > 0 &&
              stages.map((stage, index) => (
                <ListItem
                  key={stage.id}
                  onPress={() => handlePressListElement(stage)}
                >
                  {stage.title}
                </ListItem>
              ))}
          </ScrollView>

          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={onCancel}
            style={styles.dismissButton}
            textStyle={styles.dismissButtonText}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: Dimensions.get('window').height * 0.8,
    width: '90%',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
  },
  guestureContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: GlobalStyles.colors.grayDark,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  searchContainer: {
    width: '100%',
  },
  listContainer: {
    height: Dimensions.get('window').height * 0.8,
    width: '80%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  dismissButton: {
    marginHorizontal: 'auto',
  },
  dismissButtonText: {
    color: GlobalStyles.colors.grayMedium,
  },
});

export default MinorStageSelectorList;
