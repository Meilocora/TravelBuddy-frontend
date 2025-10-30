import { ReactElement, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

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

interface MajorStageListElementProps {
  journeyId: number;
  majorStage: MajorStage;
  index: number;
  onDelete: (majorStageId: number) => void;
  onLongPress: () => void;
  isActive: boolean;
}

const MajorStageListElement: React.FC<MajorStageListElementProps> = ({
  journeyId,
  majorStage,
  index,
  onDelete,
  onLongPress,
  isActive,
}): ReactElement => {
  // TODO: Delete onDelete and index
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

  const [isopen, setIsOpen] = useState(false);

  const moneyAvailable = formatAmount(majorStage.costs.budget);
  const moneyPlanned = formatAmount(majorStage.costs.spent_money);
  const startDate = formatDateString(majorStage.scheduled_start_time);
  const endDate = formatDateString(majorStage.scheduled_end_time);
  const durationInDays = formatDurationToDays(
    majorStage.scheduled_start_time,
    majorStage.scheduled_end_time
  );
  const isOver = validateIsOver(majorStage.scheduled_end_time);

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

  return (
    <View
      style={[
        styles.outerContainer,
        isOver && styles.inactiveOuterContainer,
        majorStage.currentMajorStage && styles.currentOuterContainer,
      ]}
    >
      {/* <LinearGradient
        colors={['#f1dfcf', '#b8a671']}
        style={{ height: '100%' }}
      > */}
      <View style={styles.buttonsContainer}>
        <IconButton
          icon={Icons.edit}
          color={GlobalStyles.colors.amberAccent}
          onPress={handleEdit}
          containerStyle={styles.icon}
        />
        {!isopen ? (
          <IconButton
            icon={Icons.openDetails}
            onPress={() => setIsOpen(true)}
            color={GlobalStyles.colors.amberAccent}
            containerStyle={styles.icon}
          />
        ) : (
          <IconButton
            icon={Icons.closeDetails}
            onPress={() => setIsOpen(false)}
            color={GlobalStyles.colors.amberAccent}
            containerStyle={styles.icon}
          />
        )}
      </View>
      <Pressable
        style={({ pressed }) => pressed && styles.pressed}
        android_ripple={{ color: GlobalStyles.colors.accent100 }}
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
            <ElementTitle>{`${majorStage.order.toString()}. ${
              majorStage.title
            }`}</ElementTitle>
          </View>
          <ElementComment content={`${startDate} - ${endDate}`} />
          {isopen ? (
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
              <IconButton
                icon={Icons.country}
                onPress={() => {}}
                color={GlobalStyles.colors.gray500}
                size={18}
                containerStyle={styles.icon}
              />
              <Text>{majorStage.country.name}</Text>
            </View>
          )}
        </View>
        {/* <CustomProgressBar
            startDate={majorStage.scheduled_start_time}
            endDate={majorStage.scheduled_end_time}
          /> */}
      </Pressable>
      {/* </LinearGradient> */}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    // borderColor: GlobalStyles.colors.gray700,
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
    shadowColor: GlobalStyles.colors.gray700,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  currentOuterContainer: {
    // borderColor: 'gold',
    borderColor: GlobalStyles.colors.amberAccent,
  },
  inactiveOuterContainer: {
    borderColor: GlobalStyles.colors.gray300,
  },
  pressed: {
    opacity: 0.5,
  },
  innerContainer: {
    // backgroundColor: GlobalStyles.colors.accent100,
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
    justifyContent: 'flex-end',
    zIndex: 1,
    right: 4,
    top: 5,
  },
  icon: {
    paddingHorizontal: 0,
    marginHorizontal: 4,
  },
  roughDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MajorStageListElement;
