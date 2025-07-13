import { ReactElement } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';

import ActivityIcon from '../../../assets/activity.svg';
import AccommodationIcon from '../../../assets/accommodation.svg';
import PlaceToVisitIcon from '../../../assets/placeToVisit.svg';
import BoatIcon from '../../../assets/boat_clean.svg';
import CarIcon from '../../../assets/car_clean.svg';
import BusIcon from '../../../assets/bus_clean.svg';
import PlaneIcon from '../../../assets/plane_clean.svg';
import TrainIcon from '../../../assets/train_clean.svg';
import OtherIcon from '../../../assets/other_clean.svg';
import { GlobalStyles } from '../../constants/styles';
import { Location } from '../../models';

const iconMap: { [key: string]: React.FC<any> } = {
  accommodation: AccommodationIcon,
  activity: ActivityIcon,
  placeToVisit: PlaceToVisitIcon,
  transportation_boat: BoatIcon,
  transportation_car: CarIcon,
  transportation_bus: BusIcon,
  transportation_plane: PlaneIcon,
  transportation_train: TrainIcon,
  transportation_other: OtherIcon,
};

const heigth = 15;
const width = 15;

interface MapLocationListElementProps {
  location: Location;
  selected: boolean;
  onPress: (location: Location) => void;
}

const MapLocationListElement: React.FC<MapLocationListElementProps> = ({
  location,
  selected,
  onPress,
}): ReactElement => {
  const { locationType, transportationType, color, done } = location;

  // Construct the icon key
  let iconKey: string = locationType;
  if (locationType.toString().startsWith('transportation')) {
    iconKey = `transportation_${transportationType?.toLowerCase()}`;
  }
  // Get the corresponding icon component
  const IconComponent = iconMap[iconKey] || null; // Fallback to null if no icon is found

  return (
    <Pressable
      style={[styles.textRowContainer, selected && styles.selectedRow]}
      onPress={() => onPress(location)}
    >
      {IconComponent && (
        <IconComponent
          width={width}
          height={heigth}
          fill={color || 'black'}
          style={[styles.icon, done && styles.iconDone]}
        />
      )}
      <Text numberOfLines={1}>{location.data.name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  textRowContainer: {
    flexDirection: 'row',
    maxWidth: 250,
    marginVertical: 2,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  selectedRow: {
    backgroundColor: GlobalStyles.colors.accent50,
  },
  selectedText: {
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 5,
    alignSelf: 'center',
  },
  iconDone: {
    opacity: 0.5,
  },
});

export default MapLocationListElement;
