import { ReactElement, useContext, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import {
  Icons,
  JourneyBottomTabsParamsList,
  MajorStageStackParamList,
  MinorStage,
} from '../../models';
import ElementTitle from '../UI/list/ElementTitle';
import ElementComment from '../UI/list/ElementComment';
import {
  formatAmount,
  formatDateString,
  formatDuration,
  formatDurationToDays,
  validateIsOver,
} from '../../utils';
import { GlobalStyles } from '../../constants/styles';
import ContentBox from './contentbox/ContentBox';
import IconButton from '../UI/IconButton';
import DetailArea, { ElementDetailInfo } from '../UI/list/DetailArea';
import AccommodationBox from './AccommodationBox';
import CustomProgressBar from '../UI/CustomProgressBar';
import { StagesContext } from '../../store/stages-context';
import BoatIcon from '../../../assets/boat.svg';
import CarIcon from '../../../assets/car.svg';
import BusIcon from '../../../assets/bus.svg';
import PlaneIcon from '../../../assets/plane.svg';
import TrainIcon from '../../../assets/train.svg';
import OtherIcon from '../../../assets/other.svg';
import { ImageContext } from '../../store/image-context';
import LocalImagesList from '../Images/LocalImagesList';

const iconMap: { [key: string]: React.FC<any> } = {
  boat: BoatIcon,
  car: CarIcon,
  bus: BusIcon,
  plane: PlaneIcon,
  train: TrainIcon,
  other: OtherIcon,
};

interface MinorStageListElementProps {
  minorStage: MinorStage;
  onLongPress: () => void;
  isActive: boolean;
}

const MinorStageListElement: React.FC<MinorStageListElementProps> = ({
  minorStage,
  onLongPress,
  isActive,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MajorStageStackParamList>>();
  const mapNavigation =
    useNavigation<BottomTabNavigationProp<JourneyBottomTabsParamsList>>();

  const stagesCtx = useContext(StagesContext);
  const imageCtx = useContext(ImageContext);

  const [isOpen, setIsOpen] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const majorStage = stagesCtx.findMinorStagesMajorStage(minorStage.id);
  const majorStageId = majorStage?.id!;
  const journey = stagesCtx.findMajorStagesJourney(majorStage!.id);
  const journeyId = journey?.id!;

  const startDate = formatDateString(minorStage.scheduled_start_time);
  const endDate = formatDateString(minorStage.scheduled_end_time);
  const durationInDays = formatDurationToDays(
    minorStage.scheduled_start_time,
    minorStage.scheduled_end_time
  );
  const moneyAvailable = formatAmount(minorStage.costs.budget);
  const moneyPlanned = formatAmount(minorStage.costs.spent_money);
  const isOver = validateIsOver(minorStage.scheduled_end_time);
  const hasImages = imageCtx.hasImages('MinorStage', minorStage.id);

  const transportDuration = formatDuration(
    minorStage?.transportation?.start_time,
    minorStage?.transportation?.start_time_offset,
    minorStage?.transportation?.arrival_time,
    minorStage?.transportation?.arrival_time_offset
  );

  const IconComponent =
    iconMap[
      minorStage!.transportation
        ? minorStage.transportation.type.toString().toLowerCase()
        : 'other'
    ] || null; // Fallback to null if no icon is found

  const elementDetailInfo: ElementDetailInfo[] = [
    {
      icon: Icons.duration,
      value: `${durationInDays} days`,
    },
    {
      icon: Icons.currency,
      value: `${moneyPlanned} / ${moneyAvailable}`,
      textStyle: minorStage.costs.money_exceeded
        ? { color: GlobalStyles.colors.error200, fontWeight: 'bold' }
        : undefined,
    },
  ];

  function handleEdit() {
    navigation.navigate('ManageMinorStage', {
      journeyId: journeyId,
      majorStageId: majorStageId,
      minorStageId: minorStage.id,
    });
  }

  function handleTapMap() {
    mapNavigation.navigate('Map', {
      majorStage: undefined,
      minorStage: minorStage,
    });
  }

  return (
    <>
      <LocalImagesList
        visible={showImages}
        handleClose={() => setShowImages(false)}
        minorStageId={minorStage.id}
      />
      <View
        style={[
          styles.outerContainer,
          isOver && styles.inactiveOuterContainer,
          minorStage.currentMinorStage && styles.currentOuterContainer,
        ]}
      >
        <View style={styles.buttonsContainer}>
          <IconButton
            icon={Icons.mapFilled}
            color={GlobalStyles.colors.purpleAccent}
            onPress={handleTapMap}
            containerStyle={styles.icon}
          />
          <IconButton
            icon={Icons.edit}
            color={GlobalStyles.colors.purpleAccent}
            onPress={handleEdit}
            containerStyle={styles.icon}
          />
          {hasImages && (
            <IconButton
              icon={Icons.images}
              color={GlobalStyles.colors.purpleAccent}
              onPress={() => setShowImages(true)}
              containerStyle={styles.icon}
            />
          )}
          {!isOpen ? (
            <IconButton
              icon={Icons.openDetails}
              onPress={() => setIsOpen(true)}
              color={GlobalStyles.colors.purpleAccent}
              containerStyle={styles.icon}
              size={30}
            />
          ) : (
            <IconButton
              icon={Icons.closeDetails}
              onPress={() => setIsOpen(false)}
              color={GlobalStyles.colors.purpleAccent}
              containerStyle={styles.icon}
              size={30}
            />
          )}
        </View>
        <Pressable
          onLongPress={onLongPress}
          style={({ pressed }) => pressed && styles.pressed}
          android_ripple={{ color: GlobalStyles.colors.purpleAccent }}
        >
          <View
            style={[
              styles.innerContainer,
              isActive && styles.activeInnerContainer,
            ]}
          >
            <View style={styles.headerContainer}>
              <ElementTitle>{`${minorStage.position.toString()}. ${
                minorStage.title
              }`}</ElementTitle>
            </View>
            <ElementComment content={`${startDate} - ${endDate}`} />
            {isOpen && (
              <>
                <DetailArea elementDetailInfo={elementDetailInfo} />
                {minorStage.accommodation.place !== '' && (
                  <AccommodationBox
                    minorStage={minorStage}
                    customCountryId={majorStage?.country.id!}
                  />
                )}
                <ContentBox
                  journeyId={journeyId}
                  majorStageId={majorStageId}
                  minorStage={minorStage}
                />
              </>
            )}
            {!isOpen && minorStage.accommodation.place && (
              <View style={styles.roughDetailsContainer}>
                <View style={styles.roughDetailsRow}>
                  <IconButton
                    icon={Icons.place}
                    onPress={() => {}}
                    color={GlobalStyles.colors.grayMedium}
                    size={18}
                    containerStyle={styles.icon}
                  />
                  <Text style={styles.text} numberOfLines={2}>
                    {minorStage.accommodation.place}
                  </Text>
                </View>
                {minorStage.transportation && IconComponent && (
                  <View style={styles.roughDetailsRow}>
                    <IconComponent
                      width={18}
                      height={18}
                      fill={GlobalStyles.colors.grayMedium}
                    />
                    <Text
                      style={{ marginLeft: 4 }}
                    >{`(${transportDuration})`}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          {/* <CustomProgressBar
        startDate={minorStage.scheduled_start_time}
        endDate={minorStage.scheduled_end_time}
      /> */}
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    borderColor: GlobalStyles.colors.purpleDark,
    borderWidth: 2,
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    elevation: 4,
    shadowColor: GlobalStyles.colors.grayDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  currentOuterContainer: {
    borderColor: 'gold',
    elevation: 10,
    shadowColor: 'gold',
  },
  inactiveOuterContainer: {
    borderColor: GlobalStyles.colors.grayMedium,
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
  innerContainer: {
    backgroundColor: GlobalStyles.colors.purpleSoft,
    justifyContent: 'center',
    padding: 10,
  },
  activeInnerContainer: {
    opacity: 0.6,
  },
  headerContainer: {
    flex: 1,
    width: '80%',
    marginRight: '15%',
    justifyContent: 'center',
  },
  iconContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
    right: 4,
    top: 5,
    flexWrap: 'wrap',
    width: 70,
  },
  icon: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  roughDetailsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
  roughDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    maxWidth: '80%',
    flexWrap: 'wrap',
  },
});

export default MinorStageListElement;
