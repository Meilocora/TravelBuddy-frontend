import { ReactElement, useContext, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Icons, MajorStageStackParamList, MinorStage } from '../../models';
import ElementTitle from '../UI/list/ElementTitle';
import ElementComment from '../UI/list/ElementComment';
import {
  formatAmount,
  formatDateString,
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

  const [isOpen, setIsOpen] = useState(false);

  const stagesCtx = useContext(StagesContext);

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

  return (
    <View
      style={[
        styles.outerContainer,
        isOver && styles.inactiveOuterContainer,
        minorStage.currentMinorStage && styles.currentOuterContainer,
      ]}
    >
      <View style={styles.buttonsContainer}>
        <IconButton
          icon={Icons.edit}
          color={GlobalStyles.colors.purpleAccent}
          onPress={handleEdit}
          containerStyle={styles.icon}
        />
        {!isOpen ? (
          <IconButton
            icon={Icons.openDetails}
            onPress={() => setIsOpen(true)}
            color={GlobalStyles.colors.purpleAccent}
            containerStyle={styles.icon}
          />
        ) : (
          <IconButton
            icon={Icons.closeDetails}
            onPress={() => setIsOpen(false)}
            color={GlobalStyles.colors.purpleAccent}
            containerStyle={styles.icon}
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
              <IconButton
                icon={Icons.place}
                onPress={() => {}}
                color={GlobalStyles.colors.gray500}
                size={18}
                containerStyle={styles.icon}
              />
              <Text>{minorStage.accommodation.place}</Text>
              {/* TODO: Add Transportation Medium here (+ traveltime) */}
            </View>
          )}
        </View>
        {/* <CustomProgressBar
        startDate={minorStage.scheduled_start_time}
        endDate={minorStage.scheduled_end_time}
      /> */}
      </Pressable>
    </View>
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
    elevation: 6,
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
    justifyContent: 'center',
  },
});

export default MinorStageListElement;
