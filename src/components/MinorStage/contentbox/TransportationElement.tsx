import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ButtonMode,
  ColorScheme,
  Location,
  LocationType,
  MapLocation,
  StackParamList,
  Transportation,
  TransportationType,
} from '../../../models';
import Button from '../../UI/Button';
import {
  formatAmount,
  formatDateTimeString,
  formatDuration,
  validateIsOverDateTime,
} from '../../../utils';
import Link from '../../UI/Link';
import TextLink from '../../UI/TextLink';
import { useContext } from 'react';
import { UserContext } from '../../../store/user-context';

interface TransportElementInfopointProps {
  subtitle: string;
  data: string;
  location?: MapLocation;
  colorScheme: 'accent' | 'complementary';
  transportationType: TransportationType;
  done?: boolean;
}

export const TransportElementInfopoint: React.FC<
  TransportElementInfopointProps
> = ({ subtitle, data, location, colorScheme, transportationType, done }) => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  function handleShowLocation() {
    const mapLocation: Location = {
      belonging: 'Undefined',
      locationType:
        `transportation_${subtitle.toLowerCase()}` as unknown as LocationType,
      data: {
        name: location?.title!,
        latitude: location?.lat!,
        longitude: location?.lng!,
      },
      transportationType: transportationType,
      done: done ? done : false,
    };
    navigation.navigate('ShowMap', {
      location: mapLocation,
      colorScheme: colorScheme,
    });
  }

  return (
    <View style={infoPointStyles.innerContainer}>
      <View style={infoPointStyles.subtitleContainer}>
        {location ? (
          <TextLink
            onPress={handleShowLocation}
            textStyle={infoPointStyles.locationLink}
          >
            {subtitle}:
          </TextLink>
        ) : (
          <Text style={infoPointStyles.subtitle}>{subtitle}:</Text>
        )}
      </View>
      <View style={infoPointStyles.data}>
        <Text>{data}</Text>
      </View>
    </View>
  );
};

const infoPointStyles = StyleSheet.create({
  innerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 3,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '30%',
  },
  subtitle: {
    fontWeight: 'bold',
  },
  data: {
    width: '70%',
    overflow: 'hidden',
  },
  locationLink: {
    color: 'blue',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

interface TransportationElementProps {
  transportation: Transportation | undefined;
  handleAdd: () => void;
  handleEdit: (id: number) => void;
  minorStageIsOver?: boolean;
}

const TransportationElement: React.FC<TransportationElementProps> = ({
  transportation,
  handleAdd,
  handleEdit,
  minorStageIsOver,
}) => {
  const userCtx = useContext(UserContext);
  if (transportation === undefined) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>No transportation found.</Text>
        {!minorStageIsOver && (
          <Button
            onPress={handleAdd}
            colorScheme={ColorScheme.complementary}
            mode={ButtonMode.flat}
          >
            Add Transportation
          </Button>
        )}
      </View>
    );
  }

  const duration = formatDuration(
    transportation.start_time,
    transportation.start_time_offset,
    transportation.arrival_time,
    transportation.arrival_time_offset
  );
  const doneStart = validateIsOverDateTime(
    transportation.start_time,
    transportation.start_time_offset,
    userCtx.timezoneoffset
  );
  const doneArrival = validateIsOverDateTime(
    transportation.arrival_time,
    transportation.arrival_time_offset,
    userCtx.timezoneoffset
  );

  const infoPointsData = [
    {
      subtitle: 'Departure',
      data: `${formatDateTimeString(transportation.start_time)} at ${
        transportation.place_of_departure
      }`,
      location: {
        title: transportation.place_of_departure,
        lat: transportation.departure_latitude,
        lng: transportation.departure_longitude,
      },
      done: doneStart,
    },
    {
      subtitle: 'Arrival',
      data: `${formatDateTimeString(transportation.arrival_time)} at ${
        transportation.place_of_arrival
      }`,
      location: {
        title: transportation.place_of_arrival,
        lat: transportation.arrival_latitude,
        lng: transportation.arrival_longitude,
      },
      done: doneArrival,
    },
    {
      subtitle: 'Details',
      data: `${duration} by ${transportation.type} (${formatAmount(
        transportation.transportation_costs
      )})`,
    },
  ];

  return (
    <View style={styles.container}>
      {infoPointsData.map((infoPoint, index) => (
        <TransportElementInfopoint
          key={index}
          subtitle={infoPoint.subtitle}
          data={infoPoint.data}
          location={infoPoint.location}
          colorScheme='complementary'
          transportationType={transportation.type as TransportationType}
        />
      ))}
      {transportation.link && (
        <Link link={transportation.link} style={styles.link} />
      )}
      {!minorStageIsOver && (
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => handleEdit(transportation.id)}
            colorScheme={ColorScheme.complementary}
          >
            Edit
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  infoText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  link: {
    marginHorizontal: 'auto',
    marginVertical: 0,
    paddingVertical: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: {
    marginVertical: 0,
    paddingVertical: 0,
  },
});

export default TransportationElement;
