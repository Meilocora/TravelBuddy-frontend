import {
  ReactElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
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
import HeaderTitle from '../components/UI/HeaderTitle';
import { GlobalStyles } from '../constants/styles';
import { useAppData } from '../hooks/useAppData';

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

  const placesCtx = useContext(PlaceContext);
  const { triggerRefresh } = useAppData();

  // TODO: This needed?
  const majorStageId = route.params?.majorStageId;
  const placeId = route.params?.placeId;
  const initialLat = route.params.lat;
  const initialLng = route.params.lng;

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
  const defaultValues = useMemo<PlaceValues | undefined>(() => {
    return {
      countryId: countryId!,
      name: selectedPlace?.name || '',
      description: selectedPlace?.description || '',
      visited: selectedPlace?.visited || false,
      favorite: selectedPlace?.favorite || false,
      latitude: selectedPlace?.latitude || initialLat || undefined,
      longitude: selectedPlace?.longitude || initialLng || undefined,
      link: selectedPlace?.link || '',
    };
  }, [selectedPlace]);

  async function confirmHandler({ status, error, place }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else if (place && status === 200) {
        placesCtx.updatePlace(place);
        triggerRefresh();
        navigation.goBack();
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else if (place && status === 201) {
        placesCtx.addPlace(place);
        triggerRefresh();
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
      triggerRefresh();
      navigation.goBack();
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: GlobalStyles.colors.grayDark,
      headerTitle: () => (
        <HeaderTitle
          title={isEditing ? `Manage ${selectedPlace?.name}` : 'Add Place'}
        />
      ),
    });
  }, [navigation, selectedPlace?.name]);

  return (
    <View style={styles.root}>
      <MainGradient />
      <PlaceForm
        key={isEditing ? String(placeId) : 'New'}
        onCancel={() => navigation.goBack()}
        onSubmit={confirmHandler}
        onDelete={deleteHandler}
        submitButtonLabel={isEditing ? 'Update' : 'Add'}
        defaultValues={defaultValues}
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
