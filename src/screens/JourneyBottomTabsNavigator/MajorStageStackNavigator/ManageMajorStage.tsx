import React, {
  ReactElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  MajorStage,
  MajorStageValues,
  JourneyBottomTabsParamsList,
  Icons,
  MajorStageStackParamList,
} from '../../../models';
import { formatDateString } from '../../../utils';
import Modal from '../../../components/UI/Modal';
import ErrorOverlay from '../../../components/UI/ErrorOverlay';
import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../../components/UI/IconButton';
import MajorStageForm from '../../../components/MajorStage/ManageMajorStage/MajorStageForm';
import { deleteMajorStage } from '../../../utils/http';
import { StagesContext } from '../../../store/stages-context';
import HeaderTitle from '../../../components/UI/HeaderTitle';

interface ManageMajorStageProps {
  navigation: NativeStackNavigationProp<
    MajorStageStackParamList,
    'ManageMajorStage'
  >;
  route: RouteProp<MajorStageStackParamList, 'ManageMajorStage'>;
}

interface ConfirmHandlerProps {
  error?: string;
  status: number;
  majorStage?: MajorStage;
}

const ManageMajorStage: React.FC<ManageMajorStageProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const planningNavigation =
    useNavigation<BottomTabNavigationProp<JourneyBottomTabsParamsList>>();

  const stagesCtx = useContext(StagesContext);
  const editedMajorStageId = route.params?.majorStageId;
  const journeyId = route.params.journeyId;
  let isEditing = !!editedMajorStageId;

  const selectedMajorStage = stagesCtx.findMajorStage(editedMajorStageId || 0);

  // Empty, when no default values provided
  const [majorStageValues, setMajorStageValues] = useState<MajorStageValues>({
    title: selectedMajorStage?.title || '',
    scheduled_start_time: selectedMajorStage?.scheduled_start_time
      ? formatDateString(selectedMajorStage.scheduled_start_time)!
      : null,
    scheduled_end_time: selectedMajorStage?.scheduled_end_time
      ? formatDateString(selectedMajorStage.scheduled_end_time)!
      : null,
    additional_info: selectedMajorStage?.additional_info || '',
    budget: selectedMajorStage?.costs.budget || 0,
    spent_money: selectedMajorStage?.costs.spent_money || 0,
    country: selectedMajorStage ? selectedMajorStage.country.name : '',
  });

  useFocusEffect(
    useCallback(() => {
      // JourneyValues set, when screen is focused
      setMajorStageValues({
        title: selectedMajorStage?.title || '',
        scheduled_start_time: selectedMajorStage?.scheduled_start_time
          ? formatDateString(selectedMajorStage.scheduled_start_time)!
          : null,
        scheduled_end_time: selectedMajorStage?.scheduled_end_time
          ? formatDateString(selectedMajorStage.scheduled_end_time)!
          : null,
        additional_info: selectedMajorStage?.additional_info || '',
        budget: selectedMajorStage?.costs.budget || 0,
        spent_money: selectedMajorStage?.costs.spent_money || 0,
        country: selectedMajorStage ? selectedMajorStage.country.name : '',
      });

      return () => {
        // Clean up function, when screen is unfocused
        resetValues();
        // reset majorStageId in navigation paramms
        navigation.setParams({ majorStageId: undefined });
      };
    }, [selectedMajorStage])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitle
          title={
            isEditing
              ? `Manage "${selectedMajorStage?.title}"`
              : 'Add Major Stage'
          }
        />
      ),
    });
  }, [navigation, isEditing]);

  async function deleteMajorStageHandler() {
    try {
      const { error, status } = await deleteMajorStage(editedMajorStageId!);
      if (!error && status === 200) {
        stagesCtx.fetchStagesData();
        const popupText = `Major Stage successfully deleted!`;
        planningNavigation.navigate('Planning', {
          journeyId: journeyId,
          popupText: popupText,
        });
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete major stage!');
    }
    setIsDeleting(false);
    return;
  }

  function resetValues() {
    setMajorStageValues({
      title: '',
      scheduled_start_time: null,
      scheduled_end_time: null,
      additional_info: '',
      budget: 0,
      spent_money: 0,
      country: '',
    });
  }

  function deleteHandler() {
    setIsDeleting(true);
  }

  function closeModalHandler() {
    setIsDeleting(false);
  }

  function cancelHandler() {
    planningNavigation.navigate('Planning', { journeyId: journeyId });
  }

  async function confirmHandler({
    status,
    error,
    majorStage,
  }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else if (majorStage && status === 200) {
        stagesCtx.fetchStagesData();
        resetValues();
        const popupText = `"${majorStage.title}" successfully updated!`;
        planningNavigation.navigate('Planning', {
          journeyId: journeyId,
          popupText: popupText,
        });
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else if (majorStage && status === 201) {
        stagesCtx.fetchStagesData();
        resetValues();
        const popupText = `"${majorStage.title}" successfully created!`;
        planningNavigation.navigate('Planning', {
          journeyId: journeyId,
          popupText: popupText,
        });
      }
    }
  }

  return (
    <View style={styles.root}>
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`If you delete ${majorStageValues.title}, all related Minor Stages will also be deleted permanently`}
          onConfirm={deleteMajorStageHandler}
          onCancel={closeModalHandler}
        />
      )}
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <Animated.ScrollView entering={FadeInDown} nestedScrollEnabled={true}>
        <MajorStageForm
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={isEditing ? majorStageValues : undefined}
          isEditing={isEditing}
          editMajorStageId={editedMajorStageId}
          journeyId={journeyId}
        />
        {isEditing && (
          <View style={styles.btnContainer}>
            <IconButton
              icon={Icons.delete}
              color={GlobalStyles.colors.error200}
              onPress={deleteHandler}
              size={36}
            />
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  btnContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
});

export default ManageMajorStage;
