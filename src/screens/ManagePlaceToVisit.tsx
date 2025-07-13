import { ReactElement, useContext, useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ManagePlaceToVisitRouteProp,
  PlaceToVisit,
  PlaceValues,
  StackParamList,
} from '../models';
import { PlaceContext } from '../store/place-context';
import PlaceForm from '../components/Locations/Places/PlaceForm';
import MainGradient from '../components/UI/LinearGradients/MainGradient';
import { CustomCountryContext } from '../store/custom-country-context';
import { StagesContext } from '../store/stages-context';
import HeaderTitle from '../components/UI/HeaderTitle';

interface ManagePlaceToVisitProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ManagePlaceToVisit'>;
  route: ManagePlaceToVisitRouteProp;
}

interface ConfirmHandlerProps {
  error?: string;
  status: number;
  place?: PlaceToVisit;
}

const ManagePlaceToVisit: React.FC<ManagePlaceToVisitProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);

  const customCountryCtx = useContext(CustomCountryContext);
  const placesCtx = useContext(PlaceContext);
  const stagesCtx = useContext(StagesContext);

  const majorStageId = route.params?.majorStageId;
  const placeId = route.params?.placeId;
  let isEditing = !!placeId;

  const selectedPlace = placesCtx.placesToVisit.find(
    (place) => place.id === placeId
  );

  let countryId: number | null = null;
  if (isEditing && selectedPlace) {
    countryId = selectedPlace!.countryId;
  } else if (route.params.countryId) {
    countryId = route.params.countryId;
  }

  // Empty, when no default values provided
  const [placeValues, setPlaceValues] = useState<PlaceValues>({
    countryId: countryId!,
    name: selectedPlace?.name || '',
    description: selectedPlace?.description || '',
    visited: selectedPlace?.visited || false,
    favorite: selectedPlace?.favorite || false,
    latitude: selectedPlace?.latitude || undefined,
    longitude: selectedPlace?.longitude || undefined,
    link: selectedPlace?.link || '',
  });

  async function confirmHandler({ status, error, place }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else if (place && status === 200) {
        placesCtx.updatePlace(place);
        customCountryCtx.fetchUsersCustomCountries();
        if (majorStageId) {
          stagesCtx.fetchStagesData();
        }
        navigation.goBack();
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else if (place && status === 201) {
        placesCtx.addPlace(place);
        customCountryCtx.fetchUsersCustomCountries();
        navigation.goBack();
      }
    }
  }

  function deleteHandler(response: ConfirmHandlerProps, placeId: number) {
    if (response.error) {
      setError(response.error);
      return;
    } else if (response.status === 200) {
      placesCtx.deletePlace(placeId);
      customCountryCtx.fetchUsersCustomCountries();
      navigation.goBack();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitle
          title={isEditing ? `Manage ${selectedPlace?.name}` : 'Add Place'}
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.root}>
      <MainGradient />
      <PlaceForm
        onCancel={() => navigation.goBack()}
        onSubmit={confirmHandler}
        onDelete={deleteHandler}
        submitButtonLabel={isEditing ? 'Update' : 'Add'}
        defaultValues={placeValues}
        isEditing={isEditing}
        editPlaceId={placeId!}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default ManagePlaceToVisit;
