import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { useContext, useState } from 'react';

import { ButtonMode, ColorScheme, MinorStage } from '../../../models';
import Button from '../../UI/Button';
import PlacesSelection from '../ManageMinorStage/PlacesSelection';
import { fetchavailablePlacesByCountry } from '../../../utils/http';
import PlacesListItem from '../../Locations/Places/PlacesListItem';
import { generateRandomString, validateIsOver } from '../../../utils';
import { StagesContext } from '../../../store/stages-context';

interface PlacesElementProps {
  majorStageId: number;
  minorStage: MinorStage;
  handleAdd: (name: string) => void;
  handleDelete: (name: string) => void;
}

const PlacesElement: React.FC<PlacesElementProps> = ({
  majorStageId,
  minorStage,
  handleAdd,
  handleDelete,
}) => {
  const [openSelection, setOpenSelection] = useState(false);

  const stagesCtx = useContext(StagesContext);
  const majorStage = stagesCtx.findMinorStagesMajorStage(minorStage.id);
  const countryName = majorStage!.country.name;

  let defaultPlacesNames: string[] = [];
  if (minorStage.placesToVisit) {
    defaultPlacesNames = minorStage.placesToVisit.map((place) => place.name);
  }

  function handleToggleSelection() {
    setOpenSelection((prev) => !prev);
  }

  async function handleToggleFavourite(placeId: number) {
    stagesCtx.fetchStagesData();
  }

  async function handleToggleVisited(placeId: number) {
    stagesCtx.fetchStagesData();
  }

  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      {minorStage.placesToVisit!.length === 0 ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No places selected...</Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: screenHeight / 3 }}>
          {minorStage.placesToVisit!.map((place) => (
            <PlacesListItem
              place={place}
              key={generateRandomString()}
              onToggleFavorite={handleToggleFavourite}
              onToggleVisited={handleToggleVisited}
              onRemovePlace={handleDelete}
              majorStageId={majorStageId}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleToggleSelection}
          colorScheme={ColorScheme.complementary}
          mode={ButtonMode.flat}
        >
          Add Place
        </Button>
      </View>
      {openSelection && (
        <Modal visible={openSelection} transparent>
          <PlacesSelection
            chosenPlaces={defaultPlacesNames}
            countryName={countryName}
            onAddHandler={handleAdd}
            onRemoveHandler={handleDelete}
            onCloseModal={handleToggleSelection}
            onFetchRequest={() =>
              fetchavailablePlacesByCountry(minorStage.id, countryName)
            }
            minorStageId={minorStage.id}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlacesElement;
