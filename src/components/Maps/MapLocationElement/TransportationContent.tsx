import { ReactElement, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Icons,
  JourneyBottomTabsParamsList,
  Transportation,
} from '../../../models';
import IconButton from '../../UI/IconButton';
import { StagesContext } from '../../../store/stages-context';
import { formatAmount, formatDateTimeString } from '../../../utils';
import TextLink from '../../UI/TextLink';
import { LatLng } from 'react-native-maps';
import { GlobalStyles } from '../../../constants/styles';

interface TransportationContentProps {
  minorStageId?: number;
  majorStageId?: number;
  transportation: Transportation;
  locType: 'transportation_arrival' | 'transportation_departure';
  addRoutePoint?: (coord: LatLng) => void;
}

const TransportationContent: React.FC<TransportationContentProps> = ({
  minorStageId,
  majorStageId,
  transportation,
  locType,
  addRoutePoint,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

  const stagesCtx = useContext(StagesContext);

  function handleGoToStage() {
    if (minorStageId) {
      const majorStage = stagesCtx.findMinorStagesMajorStage(minorStageId);
      const journey = stagesCtx.findMajorStagesJourney(majorStage?.id!);
      stagesCtx.setActiveHeaderHandler(minorStageId, 'transport');
      navigation.navigate('MajorStageStackNavigator', {
        screen: 'MinorStages',
        params: {
          journeyId: journey!.id,
          majorStageId: majorStage!.id,
        },
      });
    } else {
      const journey = stagesCtx.findMajorStagesJourney(majorStageId!);
      navigation.navigate('Planning', { journeyId: journey?.id! });
    }
  }

  const coord: LatLng =
    locType === 'transportation_arrival'
      ? {
          latitude: transportation.arrival_latitude!,
          longitude: transportation.arrival_longitude!,
        }
      : {
          latitude: transportation.departure_latitude!,
          longitude: transportation.departure_longitude!,
        };

  return (
    <>
      <View style={styles.textRow}>
        <View style={[styles.rowElement, { width: '100%' }]}>
          {!transportation.link ? (
            <Text style={styles.header} ellipsizeMode='tail' numberOfLines={2}>
              Transportation ({transportation.type})
            </Text>
          ) : (
            <TextLink link={transportation.link} textStyle={styles.linkHeader}>
              Transportation ({transportation.type})
            </TextLink>
          )}
          {typeof addRoutePoint !== 'undefined' && (
            <IconButton
              icon={Icons.routePlanner}
              onPress={() => addRoutePoint(coord)}
              color={GlobalStyles.colors.grayDark}
              containerStyle={styles.button}
              size={24}
            />
          )}
          <IconButton
            icon={Icons.goTo}
            onPress={handleGoToStage}
            color={GlobalStyles.colors.grayDark}
            containerStyle={styles.button}
            size={24}
          />
        </View>
      </View>
      <View style={styles.textRow}>
        <Text style={styles.subtitle}>Departure: </Text>
        <Text style={[styles.text, { maxWidth: '70%' }]}>
          {`${formatDateTimeString(transportation.start_time)} at ${
            transportation.place_of_departure
          }`}
        </Text>
      </View>
      <View style={styles.textRow}>
        <Text style={styles.subtitle}>Arrival: </Text>
        <Text style={[styles.text, { maxWidth: '70%' }]}>
          {`${formatDateTimeString(transportation.arrival_time)} at ${
            transportation.place_of_arrival
          }`}
        </Text>
      </View>
      <View style={styles.textRow}>
        <View style={styles.rowElement}>
          <IconButton
            icon={Icons.currency}
            onPress={() => {}}
            color={GlobalStyles.colors.grayDark}
            containerStyle={styles.icon}
          />
          <Text style={styles.text} ellipsizeMode='tail' numberOfLines={1}>
            {formatAmount(transportation.transportation_costs)}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  rowElement: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    width: '50%',
    flexWrap: 'wrap',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    maxWidth: '80%',
  },
  linkHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    textDecorationLine: 'underline',
  },
  description: {
    marginVertical: 2,
    fontSize: 14,
    fontStyle: 'italic',
    maxWidth: '90%',
  },
  subtitle: {
    fontWeight: 'bold',
  },
  text: {
    marginVertical: 2,
    fontSize: 14,
    textAlign: 'center',
  },
  icon: {
    marginVertical: 0,
    marginHorizontal: 'auto',
    paddingVertical: 0,
  },
  button: {
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

export default TransportationContent;
