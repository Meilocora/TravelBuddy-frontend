import { ReactElement, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Accommodation,
  Icons,
  JourneyBottomTabsParamsList,
} from '../../../models';
import IconButton from '../../UI/IconButton';
import { StagesContext } from '../../../store/stages-context';
import { formatAmount } from '../../../utils';
import TextLink from '../../UI/TextLink';
import { LatLng } from 'react-native-maps';
import { GlobalStyles } from '../../../constants/styles';

interface AccommodationContentProps {
  minorStageId: number;
  accommodation: Accommodation;
  addRoutePoint?: (coord: LatLng) => void;
}

const AccommodationContent: React.FC<AccommodationContentProps> = ({
  minorStageId,
  accommodation,
  addRoutePoint,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

  const stagesCtx = useContext(StagesContext);
  const majorStage = stagesCtx.findMinorStagesMajorStage(minorStageId);
  const journey = stagesCtx.findMajorStagesJourney(majorStage?.id!);

  function handleGoToMinorStage() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'MinorStages',
      params: {
        journeyId: journey!.id,
        majorStageId: majorStage!.id,
      },
    });
  }

  return (
    <>
      <View style={styles.textRow}>
        <View style={[styles.rowElement, { width: '100%' }]}>
          {!accommodation.link ? (
            <Text style={styles.header} ellipsizeMode='tail' numberOfLines={2}>
              {accommodation.place}
            </Text>
          ) : (
            <TextLink link={accommodation.link} textStyle={styles.linkHeader}>
              {accommodation.place}
            </TextLink>
          )}
          {typeof addRoutePoint !== 'undefined' && (
            <IconButton
              icon={Icons.routePlanner}
              onPress={() =>
                addRoutePoint({
                  latitude: accommodation.latitude,
                  longitude: accommodation.longitude,
                })
              }
              color={GlobalStyles.colors.grayDark}
              containerStyle={styles.button}
              size={24}
            />
          )}
          <IconButton
            icon={Icons.goTo}
            onPress={handleGoToMinorStage}
            color={GlobalStyles.colors.grayDark}
            containerStyle={styles.button}
            size={24}
          />
        </View>
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
            {formatAmount(accommodation.costs)}
          </Text>
        </View>
        <View style={styles.rowElement}>
          <IconButton
            icon={Icons.checkmarkFilled}
            onPress={() => {}}
            color={GlobalStyles.colors.grayDark}
            containerStyle={styles.button}
            size={24}
          />
          <Text style={styles.text}>
            {accommodation.booked ? 'Booked' : 'Not booked'}
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

export default AccommodationContent;
