import { ReactElement, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
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
  onDelete: (minorStageId: number) => void;
}

const MinorStageListElement: React.FC<MinorStageListElementProps> = ({
  minorStage,
  onDelete,
}): ReactElement => {
  const navigation =
    useNavigation<NativeStackNavigationProp<MajorStageStackParamList>>();

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
        styles.container,
        isOver && styles.inactiveContainer,
        minorStage.currentMinorStage && styles.currentOuterContainer,
      ]}
    >
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <ElementTitle>{minorStage.title}</ElementTitle>
        </View>
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
            onPress={() => onDelete(minorStage.id)}
          />
        )}
      </View>
      <ElementComment content={`${startDate} - ${endDate}`} />
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
      {/* <CustomProgressBar
        startDate={minorStage.scheduled_start_time}
        endDate={minorStage.scheduled_end_time}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: GlobalStyles.colors.complementary700,
    borderWidth: 1,
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: GlobalStyles.colors.complementary100,
  },
  currentOuterContainer: {
    borderColor: 'gold',
    borderWidth: 2,
  },
  inactiveContainer: {
    borderColor: GlobalStyles.colors.gray400,
    backgroundColor: GlobalStyles.colors.gray100,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MinorStageListElement;
