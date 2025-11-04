import { ReactElement } from 'react';
import {
  Icons,
  Location,
  LocationType,
  MinorStage,
  StackParamList,
} from '../../models';
import { StyleSheet, Text, View } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import { formatAmount, parseDate, validateIsOver } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconButton from '../UI/IconButton';
import TextLink from '../UI/TextLink';

interface AccommodationBoxProps {
  minorStage: MinorStage;
  customCountryId: number;
}

const AccommodationBox: React.FC<AccommodationBoxProps> = ({
  minorStage,
  customCountryId,
}): ReactElement => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  function handleShowLocation() {
    const location: Location = {
      belonging: 'Undefined',
      locationType: LocationType.accommodation,
      data: {
        name: minorStage.accommodation.place,
        latitude: minorStage.accommodation.latitude,
        longitude: minorStage.accommodation.longitude,
      },
      done: parseDate(minorStage.scheduled_end_time) < new Date(),
    };

    navigation.navigate('ShowMap', {
      location: location,
      colorScheme: 'complementary',
      customCountryId: customCountryId,
    });
  }

  let elementCounter = 2;
  if (minorStage.accommodation.costs > 0) {
    elementCounter += 1;
  }
  if (minorStage.accommodation.latitude && minorStage.accommodation.longitude) {
    elementCounter += 1;
  }

  const isOver = validateIsOver(minorStage.scheduled_end_time);

  return (
    <View style={styles.container}>
      <View
        style={isOver ? styles.inactiveTitleContainer : styles.titleContainer}
      >
        <Text style={styles.title}>Accommodation</Text>
      </View>
      <View style={styles.row}>
        <View style={{ width: `${100 / elementCounter}%` }}>
          <IconButton
            icon={Icons.place}
            onPress={() => {}}
            color={GlobalStyles.colors.grayMedium}
            containerStyle={styles.icon}
          />
          {minorStage.accommodation.link ? (
            <TextLink
              link={minorStage.accommodation.link}
              textStyle={styles.link}
            >
              {minorStage.accommodation.place}
            </TextLink>
          ) : (
            <Text style={styles.content}>{minorStage.accommodation.place}</Text>
          )}
        </View>
        {minorStage.accommodation.costs > 0 && (
          <View style={{ width: `${100 / elementCounter}%` }}>
            <IconButton
              icon={Icons.currency}
              onPress={() => {}}
              color={GlobalStyles.colors.grayMedium}
              containerStyle={styles.icon}
            />
            <Text style={styles.content}>
              {formatAmount(minorStage.accommodation.costs)}
            </Text>
          </View>
        )}
        <View style={{ width: `${100 / elementCounter}%` }}>
          <Text style={styles.subtitle}>Booked</Text>
          <Text style={styles.content}>
            {minorStage.accommodation.booked ? (
              <IconButton
                icon={Icons.checkmarkOutline}
                onPress={() => {}}
                containerStyle={styles.icon}
                color={GlobalStyles.colors.purpleAccent}
              />
            ) : (
              <IconButton
                icon={Icons.remove}
                onPress={() => {}}
                containerStyle={styles.icon}
                color={GlobalStyles.colors.purpleAccent}
              />
            )}
          </Text>
        </View>
        {minorStage.accommodation.latitude &&
          minorStage.accommodation.longitude && (
            <View style={{ width: `${100 / elementCounter}%` }}>
              <IconButton
                icon={Icons.location}
                onPress={handleShowLocation}
                color={GlobalStyles.colors.purpleAccent}
                containerStyle={styles.button}
                size={30}
              />
            </View>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GlobalStyles.colors.grayDark,
  },
  titleContainer: {
    position: 'absolute',
    left: '50%',
    top: -12,
    transform: [{ translateX: -60 }],
    backgroundColor: GlobalStyles.colors.purpleSoft,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inactiveTitleContainer: {
    position: 'absolute',
    left: '50%',
    top: -12,
    transform: [{ translateX: -60 }],
    backgroundColor: GlobalStyles.colors.graySoft,
    paddingHorizontal: 10,
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GlobalStyles.colors.grayMedium,
    textAlign: 'center',
  },
  content: {
    fontSize: 14,
    color: GlobalStyles.colors.grayDark,
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  button: {
    marginHorizontal: 'auto',
  },
  icon: {
    paddingVertical: 0,
    marginHorizontal: 'auto',
  },
});

export default AccommodationBox;
