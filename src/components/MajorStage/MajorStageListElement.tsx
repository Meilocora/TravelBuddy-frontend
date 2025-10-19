import { ReactElement } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
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
}

const MajorStageListElement: React.FC<MajorStageListElementProps> = ({
  journeyId,
  majorStage,
  index,
  onDelete,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyBottomTabsParamsList>>();

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
      <LinearGradient
        colors={['#f1dfcf', '#b8a671']}
        style={{ height: '100%' }}
      >
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          android_ripple={{ color: GlobalStyles.colors.accent100 }}
          onPress={handleOnPress}
        >
          <View style={styles.innerContainer}>
            <View style={styles.headerContainer}>
              <ElementTitle>{majorStage.title}</ElementTitle>
              {!isOver ? (
                <IconButton
                  icon={Icons.edit}
                  color={GlobalStyles.colors.accent800}
                  onPress={handleEdit}
                />
              ) : (
                <IconButton
                  icon={Icons.delete}
                  color={GlobalStyles.colors.gray500}
                  onPress={() => onDelete(majorStage.id)}
                />
              )}
            </View>
            <ElementComment content={`${startDate} - ${endDate}`} />
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
          </View>
          {/* <CustomProgressBar
            startDate={majorStage.scheduled_start_time}
            endDate={majorStage.scheduled_end_time}
          /> */}
        </Pressable>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    borderColor: GlobalStyles.colors.accent800,
    borderWidth: 2,
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    elevation: 5,
    shadowColor: GlobalStyles.colors.gray500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  currentOuterContainer: {
    borderColor: 'gold',
  },
  inactiveOuterContainer: {
    borderColor: GlobalStyles.colors.gray400,
  },
  pressed: {
    opacity: 0.5,
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  headerContainer: {
    flex: 1,
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});

export default MajorStageListElement;
