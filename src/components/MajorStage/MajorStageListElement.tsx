import React, { ReactElement, useContext, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ButtonMode,
  ColorScheme,
  Icons,
  JourneyBottomTabsParamsList,
  MajorStage,
  StackParamList,
} from '../../models';
import {
  formatAmount,
  formatDateString,
  formatDuration,
  formatDurationToDays,
  validateIsOver,
} from '../../utils';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';
import DetailArea, { ElementDetailInfo } from '../UI/list/DetailArea';
import ElementTitle from '../UI/list/ElementTitle';
import ElementComment from '../UI/list/ElementComment';
import Button from '../UI/Button';
import TransportationBox from './TransportationBox';
import CustomProgressBar from '../UI/CustomProgressBar';
import BoatIcon from '../../../assets/boat.svg';
import CarIcon from '../../../assets/car.svg';
import BusIcon from '../../../assets/bus.svg';
import PlaneIcon from '../../../assets/plane.svg';
import TrainIcon from '../../../assets/train.svg';
import OtherIcon from '../../../assets/other.svg';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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

interface MajorStageListElementProps {
  journeyId: number;
  majorStage: MajorStage;
  onLongPress: () => void;
  isActive: boolean;
}

const MajorStageListElement: React.FC<MajorStageListElementProps> = ({
  journeyId,
  majorStage,
  onLongPress,
  isActive,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();
  const mapNavigation =
    useNavigation<BottomTabNavigationProp<JourneyBottomTabsParamsList>>();

  const imageCtx = useContext(ImageContext);

  const [isOpen, setIsOpen] = useState(false);
  const [showImages, setShowImages] = useState(false);

  let minorStageIds: number[] = [];
  majorStage.minorStages &&
    minorStageIds.push(...majorStage.minorStages.map((s) => s.id));

  const moneyAvailable = formatAmount(majorStage.costs.budget);
  const moneyPlanned = formatAmount(majorStage.costs.spent_money);
  const startDate = formatDateString(majorStage.scheduled_start_time);
  const endDate = formatDateString(majorStage.scheduled_end_time);
  const durationInDays = formatDurationToDays(
    majorStage.scheduled_start_time,
    majorStage.scheduled_end_time
  );
  const isOver = validateIsOver(majorStage.scheduled_end_time);
  const hasImages = imageCtx.hasImages('MinorStages', undefined, minorStageIds);

  const transportDuration = formatDuration(
    majorStage?.transportation?.start_time,
    majorStage?.transportation?.start_time_offset,
    majorStage?.transportation?.arrival_time,
    majorStage?.transportation?.arrival_time_offset
  );

  const IconComponent =
    iconMap[
      majorStage!.transportation
        ? majorStage.transportation.type.toString().toLowerCase()
        : 'other'
    ] || null; // Fallback to null if no icon is found

  const countryNavigation = useNavigation<NavigationProp<StackParamList>>();

  function handlePressCountryName() {
    countryNavigation.navigate('ManageCustomCountry', {
      countryId: majorStage.country.id,
    });
  }

  const elementDetailInfo: ElementDetailInfo[] = [
    {
      icon: Icons.duration,
      value: `${durationInDays} days`,
    },
    {
      icon: Icons.currency,
      value: `${moneyPlanned} / ${moneyAvailable}`,
      textStyle: majorStage.costs.money_exceeded
        ? { color: GlobalStyles.colors.error200 }
        : undefined,
    },
    {
      icon: Icons.country,
      value: majorStage.country.name,
      onPress: handlePressCountryName,
    },
  ];

  if (majorStage.minorStages) {
    elementDetailInfo.push({
      title: 'Minor Stages',
      value: majorStage.minorStages.length.toString(),
    });
  } else {
    elementDetailInfo.push({
      title: 'Minor Stages',
      value: '0',
    });
  }

  function handleOnPress() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'MinorStages',
      params: {
        majorStageId: majorStage.id,
        journeyId: journeyId,
      },
    });
  }

  function handleEdit() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'ManageMajorStage',
      params: {
        journeyId: journeyId,
        majorStageId: majorStage.id,
      },
    });
  }

  function handleAddTransportation() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'ManageTransportation',
      params: {
        journeyId: journeyId,
        majorStageId: majorStage.id,
      },
    });
  }

  function handleEditTransportation() {
    navigation.navigate('MajorStageStackNavigator', {
      screen: 'ManageTransportation',
      params: {
        journeyId: journeyId,
        majorStageId: majorStage.id,
        transportationId: majorStage.transportation!.id,
      },
    });
  }

  function handleTapMap() {
    mapNavigation.navigate('Map', {
      majorStage: majorStage,
      minorStage: undefined,
    });
  }

  return (
    <>
      <LocalImagesList
        visible={showImages}
        handleClose={() => setShowImages(false)}
        minorStageIds={minorStageIds}
      />
      <View
        style={[
          styles.outerContainer,
          isOver && styles.inactiveOuterContainer,
          majorStage.currentMajorStage && styles.currentOuterContainer,
        ]}
      >
        <View style={styles.buttonsContainer}>
          <IconButton
            icon={Icons.mapFilled}
            color={GlobalStyles.colors.amberAccent}
            onPress={handleTapMap}
            containerStyle={styles.icon}
          />
          <IconButton
            icon={Icons.edit}
            color={GlobalStyles.colors.amberAccent}
            onPress={handleEdit}
            containerStyle={styles.icon}
          />
          {hasImages && (
            <IconButton
              icon={Icons.images}
              color={GlobalStyles.colors.amberAccent}
              onPress={() => setShowImages(true)}
              containerStyle={styles.icon}
            />
          )}
          {!isOpen ? (
            <IconButton
              icon={Icons.openDetails}
              onPress={() => setIsOpen(true)}
              color={GlobalStyles.colors.amberAccent}
              containerStyle={styles.icon}
              size={30}
            />
          ) : (
            <IconButton
              icon={Icons.closeDetails}
              onPress={() => setIsOpen(false)}
              color={GlobalStyles.colors.amberAccent}
              containerStyle={styles.icon}
              size={30}
            />
          )}
        </View>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          android_ripple={{ color: GlobalStyles.colors.amberAccent }}
          onPress={handleOnPress}
          onLongPress={onLongPress}
        >
          <View
            style={[
              styles.innerContainer,
              isActive && styles.activeInnerContainer,
            ]}
          >
            <View style={styles.headerContainer}>
              <ElementTitle>{`${majorStage.position.toString()}. ${
                majorStage.title
              }`}</ElementTitle>
            </View>
            <ElementComment content={`${startDate} - ${endDate}`} />
            {isOpen ? (
              <>
                <DetailArea elementDetailInfo={elementDetailInfo} />
                {majorStage.transportation && (
                  <TransportationBox
                    majorStageIsOver={isOver}
                    transportation={majorStage.transportation}
                    onPressEdit={handleEditTransportation}
                    customCountryId={majorStage.country.id!}
                  />
                )}
                {!majorStage.transportation && !isOver && (
                  <Button
                    onPress={handleAddTransportation}
                    mode={ButtonMode.flat}
                    colorScheme={ColorScheme.accent}
                  >
                    Add Transportation
                  </Button>
                )}
              </>
            ) : (
              <View style={styles.roughDetailsContainer}>
                <View style={styles.roughDetailsRow}>
                  <IconButton
                    icon={Icons.country}
                    onPress={() => {}}
                    color={GlobalStyles.colors.grayMedium}
                    size={18}
                    containerStyle={styles.icon}
                  />
                  <Text>{majorStage.country.name}</Text>
                </View>
                {majorStage.transportation && IconComponent && (
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
            startDate={majorStage.scheduled_start_time}
            endDate={majorStage.scheduled_end_time}
          /> */}
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderColor: GlobalStyles.colors.amberDark,
    borderWidth: 2,
    borderTopWidth: 6,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
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
    backgroundColor: GlobalStyles.colors.amberSoft,
    alignItems: 'center',
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
  },
  roughDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MajorStageListElement;
