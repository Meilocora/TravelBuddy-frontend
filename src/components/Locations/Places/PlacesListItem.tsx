import { ReactElement, useContext, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import {
  Icons,
  Location,
  LocationType,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import IconButton from '../../UI/IconButton';
import { GlobalStyles } from '../../../constants/styles';
import Link from '../../UI/Link';
import { PlaceContext } from '../../../store/place-context';
import {
  toggleFavoritePlace,
  toggleVisitedPlace,
} from '../../../utils/http/place_to_visit';

interface PlacesListItemProps {
  place: PlaceToVisit;
  onToggleFavorite: (placeId: number) => void;
  onToggleVisited: (placeId: number) => void;
  onRemovePlace?: (name: string) => void;
  majorStageId?: number;
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({
  place,
  onToggleFavorite,
  onToggleVisited,
  onRemovePlace,
  majorStageId,
}): ReactElement => {
  const [isOpened, setIsOpened] = useState(false);
  const navigation = useNavigation<NavigationProp<StackParamList>>();
  const placesCtx = useContext(PlaceContext);

  async function handleToggleFavorite() {
    const response = await toggleFavoritePlace(place.id);
    if (!response.error) {
      placesCtx.toggleFavorite(place.id);
      onToggleFavorite(place.id);
    }
  }

  async function handleToggleVisited() {
    const response = await toggleVisitedPlace(place.id);
    if (!response.error) {
      placesCtx.toggleVisited(place.id);
      onToggleVisited(place.id);
    }
  }

  function handleEdit() {
    navigation.navigate('ManagePlaceToVisit', {
      placeId: place.id,
      countryId: place.countryId,
      majorStageId: majorStageId,
    });
  }

  function handleRemove() {
    onRemovePlace?.(place.name);
  }

  function handleShowLocation() {
    const location: Location = {
      belonging: 'Undefined',
      locationType: LocationType.placeToVisit,
      data: {
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
      },
      done: place.visited,
    };

    navigation.navigate('ShowMap', {
      location: location,
      colorScheme: majorStageId ? 'complementary' : 'primary',
      customCountryId: place.countryId,
    });
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setIsOpened(!isOpened)}>
        <View style={styles.row}>
          <Text style={styles.name} ellipsizeMode='tail' numberOfLines={1}>
            {place.name}
          </Text>
          <View style={styles.buttonsContainer}>
            <IconButton
              icon={place.favorite ? Icons.heartFilled : Icons.heartOutline}
              onPress={handleToggleFavorite}
              color={GlobalStyles.colors.favorite}
              containerStyle={styles.button}
            />
            <IconButton
              icon={
                place.visited ? Icons.checkmarkFilled : Icons.checkmarkOutline
              }
              onPress={handleToggleVisited}
              color={GlobalStyles.colors.visited}
              containerStyle={styles.button}
            />
            <IconButton
              icon={Icons.editFilled}
              onPress={handleEdit}
              color={GlobalStyles.colors.edit}
              containerStyle={styles.button}
            />
            {onRemovePlace && (
              <IconButton
                icon={Icons.remove}
                onPress={handleRemove}
                color={GlobalStyles.colors.error200}
                containerStyle={styles.button}
              />
            )}
          </View>
        </View>

        {isOpened && (
          <View style={styles.additionalContainer}>
            <Text style={styles.description}>{place.description}</Text>
            <View style={styles.row}>
              {place.link && (
                <View style={styles.halfRow}>
                  <Text style={styles.detail}>Link: </Text>
                  <Link link={place.link} color={GlobalStyles.colors.visited} />
                </View>
              )}
              {place.latitude && place.longitude && (
                <View style={styles.halfRow}>
                  <Text style={styles.detail}>Map: </Text>
                  <IconButton
                    icon={Icons.location}
                    onPress={handleShowLocation}
                    color={GlobalStyles.colors.visited}
                    containerStyle={{
                      marginHorizontal: 0,
                      paddingHorizontal: 0,
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginVertical: 5,
    backgroundColor: GlobalStyles.colors.gray500,
    borderRadius: 16,
  },
  name: {
    color: GlobalStyles.colors.gray50,
    fontSize: 16,
    maxWidth: '50%',
    marginLeft: 10,
  },
  description: {
    color: GlobalStyles.colors.gray200,
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  detail: {
    color: GlobalStyles.colors.gray200,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  halfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 4,
  },
  button: {
    marginHorizontal: 0,
    paddingHorizontal: 4,
  },
  additionalContainer: {
    marginHorizontal: 8,
    paddingBottom: 8,
  },
});

export default PlacesListItem;
