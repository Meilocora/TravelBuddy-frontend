import React, { ReactElement, useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import OutsidePressHandler from 'react-native-outside-press';
import { Journey } from '../../../models';
import ListItem from '../../UI/search/ListItem';
import { StagesContext } from '../../../store/stages-context';

interface JourneySelectorProps {
  onChangeJourney: (journey: Journey) => void;
  currentJourney: Journey | undefined;
}

const JourneySelector: React.FC<JourneySelectorProps> = ({
  onChangeJourney,
  currentJourney,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState(false);
  const [journey, setJourney] = useState<Journey>();

  const stagesCtx = useContext(StagesContext);

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
  }

  function handlePressListElement(item: Journey) {
    setJourney(item);
    onChangeJourney(item);
    setOpenSelection(false);
  }

  let journeys = stagesCtx.journeys;
  if (currentJourney) {
    journeys = journeys.filter((journey) => journey.id !== currentJourney.id);
  }

  return (
    <>
      {openSelection && journeys.length > 0 && (
        <OutsidePressHandler
          onOutsidePress={handleCloseModal}
          style={styles.selectionContainer}
        >
          <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
            {journeys.length > 0 &&
              journeys.map((item) => (
                <ListItem
                  key={item.id}
                  textStyles={styles.listItem}
                  onPress={() => handlePressListElement(item)}
                >
                  {item.name}
                </ListItem>
              ))}
          </ScrollView>
        </OutsidePressHandler>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Text style={[styles.header, openSelection && styles.openHeader]}>
              {journey?.name || 'Choose a journey'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outside: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'flex-end',
  },
  header: {
    textAlign: 'center',
    color: GlobalStyles.colors.grayDark,
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 20,
    width: 150,
    fontSize: 16,
  },
  openHeader: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: GlobalStyles.colors.greenSoft,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  selectionContainer: {
    position: 'absolute',
    backgroundColor: GlobalStyles.colors.greenSoft,
    right: 0,
    top: 30,
    zIndex: 1,
    width: 150,
  },
  listContainer: {
    maxHeight: 300,
    paddingHorizontal: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 2,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  listItem: {
    fontSize: 16,
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default JourneySelector;
