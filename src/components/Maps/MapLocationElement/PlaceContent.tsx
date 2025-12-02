import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Icons,
  JourneyBottomTabsParamsList,
  PlaceToVisit,
  StackParamList,
} from '../../../models';
import IconButton from '../../UI/IconButton';
import { StagesContext } from '../../../store/stages-context';
import TextLink from '../../UI/TextLink';
import { GlobalStyles } from '../../../constants/styles';
import ImageModal from '../../UI/ImageModal';
import { isImageLink } from '../../../utils';

interface PlaceContentProps {
  place: PlaceToVisit;
  minorStageId?: number;
}

const PlaceContent: React.FC<PlaceContentProps> = ({
  place,
  minorStageId,
}): ReactElement => {
  const [showImage, setShowImage] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

  const placeNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  const stagesCtx = useContext(StagesContext);
  const majorStage = minorStageId
    ? stagesCtx.findMinorStagesMajorStage(minorStageId)
    : undefined;
  const journey = stagesCtx.findMajorStagesJourney(majorStage?.id!);

  function handleGoToStage() {
    if (minorStageId) {
      stagesCtx.setActiveHeaderHandler(minorStageId, 'places');
      navigation.navigate('MajorStageStackNavigator', {
        screen: 'MinorStages',
        params: {
          journeyId: journey!.id,
          majorStageId: majorStage!.id,
        },
      });
    }
    return;
  }

  function handleEditPlace() {
    placeNavigation.navigate('ManagePlaceToVisit', {
      placeId: place.id,
      countryId: place.countryId,
    });
  }

  return (
    <>
      {isImageLink(place.link) && (
        <ImageModal
          link={place.link!}
          onClose={() => setShowImage(false)}
          visible={showImage}
        />
      )}
      <View style={styles.textRow}>
        <View style={[styles.rowElement, { width: '100%' }]}>
          {!place.link ? (
            <Text style={styles.header} ellipsizeMode='tail' numberOfLines={2}>
              {place.name}
            </Text>
          ) : (
            <TextLink link={place.link} textStyle={styles.linkHeader}>
              {place.name}
            </TextLink>
          )}
          {minorStageId && (
            <IconButton
              icon={Icons.goTo}
              onPress={handleGoToStage}
              color={'black'}
              containerStyle={styles.button}
              size={24}
            />
          )}
          <IconButton
            icon={Icons.edit}
            onPress={handleEditPlace}
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
      {place.link && isImageLink(place.link) && (
        <Pressable onPress={() => setShowImage(true)} style={styles.imageRow}>
          <Image
            source={{ uri: place.link }}
            style={styles.image}
            resizeMode='cover'
          />
        </Pressable>
      )}
      <View style={styles.textRow}>
        <View style={styles.rowElement}>
          {place.favorite && (
            <IconButton
              icon={Icons.heartFilled}
              onPress={() => {}}
              color={GlobalStyles.colors.favorite}
              containerStyle={styles.button}
              size={24}
            />
          )}
          {place.visited && (
            <IconButton
              icon={Icons.checkmarkFilled}
              onPress={() => {}}
              color={GlobalStyles.colors.visited}
              containerStyle={styles.button}
              size={24}
            />
          )}
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
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  image: {
    width: '90%',
    height: 200,
    borderRadius: 8,
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
