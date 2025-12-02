import { StyleSheet, View, Text, Dimensions, Modal } from 'react-native';
import { useContext, useState } from 'react';

import { ButtonMode, ColorScheme, MinorStage } from '../../../models';
import Button from '../../UI/Button';
import PlacesSelection from '../ManageMinorStage/PlacesSelection';
import { fetchavailablePlacesByCountry } from '../../../utils/http';
import PlacesListItem from '../../Locations/Places/PlacesListItem';
import { StagesContext } from '../../../store/stages-context';
import { useAppData } from '../../../hooks/useAppData';

interface PlacesElementProps {
  majorStageId: number;
  minorStage: MinorStage;
  handleAdd: (placeId: number) => void;
  handleDelete: (placeId: number) => void;
}

const PlacesElement: React.FC<PlacesElementProps> = ({
  majorStageId,
  minorStage,
  handleAdd,
  handleDelete,
}) => {
  const [openSelection, setOpenSelection] = useState(false);

  const stagesCtx = useContext(StagesContext);
  const { triggerRefresh } = useAppData();

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
    triggerRefresh();
  }

  async function handleToggleVisited(placeId: number) {
    triggerRefresh();
  }

  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      {minorStage.placesToVisit!.length === 0 ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No places selected...</Text>
        </View>
      ) : (
        <View>
          {minorStage.placesToVisit!.map((place) => (
            <PlacesListItem
              key={place.id.toString()}
              place={place}
              onToggleFavorite={handleToggleFavourite}
              onToggleVisited={handleToggleVisited}
              onRemovePlace={handleDelete}
              majorStageId={majorStageId}
            />
          ))}
        </View>
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
