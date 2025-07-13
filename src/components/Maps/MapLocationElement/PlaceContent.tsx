import { ReactElement, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Icons,
  JourneyBottomTabsParamsList,
  PlaceToVisit,
} from '../../../models';
import IconButton from '../../UI/IconButton';
import { StagesContext } from '../../../store/stages-context';
import TextLink from '../../UI/TextLink';
import { GlobalStyles } from '../../../constants/styles';

interface PlaceContentProps {
  minorStageId: number;
  place: PlaceToVisit;
}

const PlaceContent: React.FC<PlaceContentProps> = ({
  minorStageId,
  place,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

  const stagesCtx = useContext(StagesContext);
  const majorStage = stagesCtx.findMinorStagesMajorStage(minorStageId);
  const journey = stagesCtx.findMajorStagesJourney(majorStage?.id!);

  function handleGoToPlace() {
    stagesCtx.setActiveHeaderHandler(minorStageId, 'places');
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
          {!place.link ? (
            <Text style={styles.header} ellipsizeMode='tail' numberOfLines={1}>
              {place.name}
            </Text>
          ) : (
            <TextLink link={place.link} textStyle={styles.linkHeader}>
              {place.name}
            </TextLink>
          )}
          <IconButton
            icon={Icons.goTo}
            onPress={handleGoToPlace}
            color={'black'}
            containerStyle={styles.button}
            size={24}
          />
        </View>
      </View>
      {place.description && (
        <View style={styles.textRow}>
          <Text style={styles.description}>{place.description}</Text>
        </View>
      )}
      <View style={styles.textRow}>
        {place.favorite && (
          <View style={styles.rowElement}>
            <IconButton
              icon={Icons.heartFilled}
              onPress={() => {}}
              color={GlobalStyles.colors.favorite}
              containerStyle={styles.button}
              size={24}
            />
            <Text style={styles.text}>Favourite!</Text>
          </View>
        )}

        {place.visited && (
          <View style={styles.rowElement}>
            <IconButton
              icon={Icons.checkmarkFilled}
              onPress={() => {}}
              color={GlobalStyles.colors.visited}
              containerStyle={styles.button}
              size={24}
            />
            <Text style={styles.text}>Visited!</Text>
          </View>
        )}
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

export default PlaceContent;
