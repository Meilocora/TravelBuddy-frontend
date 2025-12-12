import React, { ReactElement, useContext, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import { Icons, PlaceToVisit } from '../../../models';
import Input from '../../UI/form/Input';
import { PlaceContext } from '../../../store/place-context';
import PlaceToVisitSelectorList from './PlaceToVisitSelectorList';
import IconButton from '../../UI/IconButton';
import { UserContext } from '../../../store/user-context';
import { LatLng } from 'react-native-maps';

interface PlaceToVisitSelectorProps {
  onChangePlace: (placeId: number | undefined) => void;
  invalid: boolean;
  defaultValue: number | undefined;
  errors: string[];
  imageCoords?: LatLng;
  autoSuggestion?: boolean;
}

const PlaceToVisitSelector: React.FC<PlaceToVisitSelectorProps> = ({
  onChangePlace,
  invalid,
  defaultValue,
  errors,
  imageCoords,
  autoSuggestion = true,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState(false);
  const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(autoSuggestion);

  const placesCtx = useContext(PlaceContext);
  const userCtx = useContext(UserContext);

  let place: PlaceToVisit | undefined;
  let places = placesCtx.placesToVisit;
  if (defaultValue) {
    place = places.find((p) => p.id === defaultValue);
  } else if (autoSuggestEnabled) {
    if (
      imageCoords &&
      imageCoords['latitude'] !== 0 &&
      imageCoords['longitude'] !== 0
    ) {
      const defaultCoords: LatLng = imageCoords;
      place = placesCtx.findNearestPlace(defaultCoords);
    } else if (userCtx.currentLocation) {
      const defaultCoords: LatLng = userCtx.currentLocation;
      place = placesCtx.findNearestPlace(defaultCoords);
    }
    defaultValue = place?.id;
    onChangePlace(place?.id);
  }

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleClearPlace() {
    setAutoSuggestEnabled(false);
    onChangePlace(undefined);
  }

  return (
    <>
      <PlaceToVisitSelectorList
        visible={openSelection}
        defaultValue={place || ''}
        onCancel={() => setOpenSelection(false)}
        onChangePlace={onChangePlace}
      />
      <View style={styles.container}>
        <View>
          <Pressable onPress={handleOpenModal}>
            <Input
              maxLength={12}
              label='Place'
              errors={errors}
              textInputConfig={{
                value: place?.name,
                readOnly: true,
                textAlign: 'left',
              }}
            />
          </Pressable>
          {defaultValue && (
            <IconButton
              icon={Icons.delete}
              onPress={handleClearPlace}
              style={styles.deleteButton}
              color={GlobalStyles.colors.graySoft}
            />
          )}
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
  deleteButton: {
    position: 'absolute',
    right: -4,
    bottom: 10,
  },
});

export default PlaceToVisitSelector;
