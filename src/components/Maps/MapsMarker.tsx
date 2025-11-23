import { ReactElement, useEffect, useRef, useState } from 'react';
import { MapMarker, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

import ActivityIcon from '../../../assets/activity.svg';
import AccommodationIcon from '../../../assets/accommodation.svg';
import PlaceToVisitIcon from '../../../assets/placeToVisit.svg';
import BoatArrivalIcon from '../../../assets/boat_arrival.svg';
import BoatDepartureIcon from '../../../assets/boat_departure.svg';
import CarArrivalIcon from '../../../assets/car_arrival.svg';
import CarDepartureIcon from '../../../assets/car_departure.svg';
import BusArrivalIcon from '../../../assets/bus_arrival.svg';
import BusDepartureIcon from '../../../assets/bus_departure.svg';
import PlaneArrivalIcon from '../../../assets/plane_arrival.svg';
import PlaneDepartureIcon from '../../../assets/plane_departure.svg';
import TrainArrivalIcon from '../../../assets/train_arrival.svg';
import TrainDepartureIcon from '../../../assets/train_departure.svg';
import OtherArrivalIcon from '../../../assets/other_arrival.svg';
import OtherDepartureIcon from '../../../assets/other_departure.svg';
import { Location } from '../../models';
import { GlobalStyles } from '../../constants/styles';

const iconMap: { [key: string]: React.FC<any> } = {
  accommodation: AccommodationIcon,
  activity: ActivityIcon,
  placeToVisit: PlaceToVisitIcon,
  transportation_departure_boat: BoatDepartureIcon,
  transportation_arrival_boat: BoatArrivalIcon,
  transportation_departure_car: CarDepartureIcon,
  transportation_arrival_car: CarArrivalIcon,
  transportation_departure_bus: BusDepartureIcon,
  transportation_arrival_bus: BusArrivalIcon,
  transportation_departure_plane: PlaneDepartureIcon,
  transportation_arrival_plane: PlaneArrivalIcon,
  transportation_departure_train: TrainDepartureIcon,
  transportation_arrival_train: TrainArrivalIcon,
  transportation_departure_other: OtherDepartureIcon,
  transportation_arrival_other: OtherArrivalIcon,
};

const heigth = 30;
const width = 30;

interface MapsMarkerProps {
  location: Location;
  active?: boolean;
  onPressMarker?: (location: Location) => void;
}

const MapsMarker: React.FC<MapsMarkerProps> = ({
  location,
  active,
  onPressMarker,
}): ReactElement => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const { description, locationType, transportationType, data, color, done } =
    location;

  const markerColor = active ? GlobalStyles.colors.visited : color;

  const semi = done || location.belonging === 'countryLocation';

  const markerRef = useRef<MapMarker>(null);

  function handlePressMarker() {
    if (onPressMarker) {
      onPressMarker(location);
    }
  }

  // Construct the icon key
  let iconKey: string = locationType;
  if (locationType.toString().startsWith('transportation')) {
    iconKey = `${locationType}_${transportationType?.toLowerCase()}`;
  }
  // Get the corresponding icon component
  const IconComponent = iconMap[iconKey] || null; // Fallback to null if no icon is found

  useEffect(() => {
    // After a short delay, stop tracking view changes to prevent flicker
    const timeout = setTimeout(() => setTracksViewChanges(false), 1);
    return () => clearTimeout(timeout);
  }, [iconKey, markerColor, done]); // rerun if icon or color changes

  return (
    <Marker
      ref={markerRef}
      title={data.name}
      tracksViewChanges={tracksViewChanges}
      coordinate={{
        latitude: data.latitude,
        longitude: data.longitude,
      }}
      description={description}
      onPress={handlePressMarker}
    >
      <View style={{ zIndex: 10 }}>
        {IconComponent && (
          <IconComponent
            width={width}
            height={heigth}
            fill={markerColor || 'black'}
            stroke={location.favourite ? 'red' : 'white'}
            strokeWidth={location.favourite ? 6 : 4}
            style={semi ? styles.iconDone : styles.icon}
          />
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  icon: {
    zIndex: 2,
  },
  iconDone: {
    opacity: 0.75,
    zIndex: 1,
  },
});

export default MapsMarker;
