import React, {
  ReactElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  MajorStage,
  MajorStageValues,
  JourneyBottomTabsParamsList,
  Icons,
  MajorStageStackParamList,
  FormLimits,
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
import { useAppData } from '../../../hooks/useAppData';

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
  const { triggerRefresh } = useAppData();

  const editedMajorStageId = route.params?.majorStageId;
  const journeyId = route.params.journeyId;
  let isEditing = !!editedMajorStageId;

  const selectedMajorStage = stagesCtx.findMajorStage(editedMajorStageId || 0);

  const defaultValues = useMemo<MajorStageValues | undefined>(() => {
    if (!selectedMajorStage) return undefined;
    return {
      title: selectedMajorStage.title ?? '',
      scheduled_start_time: selectedMajorStage.scheduled_start_time
        ? formatDateString(selectedMajorStage.scheduled_start_time)!
        : null,
      scheduled_end_time: selectedMajorStage.scheduled_end_time
        ? formatDateString(selectedMajorStage.scheduled_end_time)!
        : null,
      additional_info: selectedMajorStage.additional_info ?? '',
      budget: selectedMajorStage.costs.budget ?? 0,
      spent_money: selectedMajorStage.costs.spent_money ?? 0,
      country: selectedMajorStage.country.name ?? '',
      position: selectedMajorStage.position ?? null,
    };
  }, [selectedMajorStage]);

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
  }, [navigation, isEditing, selectedMajorStage]);

  async function deleteMajorStageHandler() {
    try {
      const { error, status } = await deleteMajorStage(editedMajorStageId!);
      if (!error && status === 200) {
        triggerRefresh();
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
        triggerRefresh();
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
        triggerRefresh();
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
          content={`If you delete ${
            defaultValues!.title
          }, all related Minor Stages will also be deleted permanently`}
          onConfirm={deleteMajorStageHandler}
          onCancel={closeModalHandler}
        />
      )}
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <Animated.ScrollView entering={FadeInDown} nestedScrollEnabled={true}>
        <MajorStageForm
          key={isEditing ? String(editedMajorStageId) : 'New'}
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={isEditing ? defaultValues : undefined}
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
              size={FormLimits.deleteSize}
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
  },
});

export default ManageMajorStage;
