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

interface TransportationContentProps {
  minorStageId?: number;
  majorStageId?: number;
  transportation: Transportation;
}

const TransportationContent: React.FC<TransportationContentProps> = ({
  minorStageId,
  majorStageId,
  transportation,
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

  return (
    <>
      <View style={styles.textRow}>
        <View style={[styles.rowElement, { width: '100%' }]}>
          {!transportation.link ? (
            <Text style={styles.header} ellipsizeMode='tail' numberOfLines={1}>
              Transportation ({transportation.type})
            </Text>
          ) : (
            <TextLink link={transportation.link} textStyle={styles.linkHeader}>
              Transportation ({transportation.type})
            </TextLink>
          )}
          <IconButton
            icon={Icons.goTo}
            onPress={handleGoToStage}
            color={'black'}
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
            color='black'
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
  },
  rowElement: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    width: '50%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
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
    marginHorizontal: 4,
    marginVertical: 0,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
});

export default TransportationContent;
