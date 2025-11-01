import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ReactElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Icons, MajorStageStackParamList, Spending } from '../../../models';
import { RouteProp } from '@react-navigation/native';
import ComplementaryGradient from '../../../components/UI/LinearGradients/ComplementaryGradient';
import { GlobalStyles } from '../../../constants/styles';
import ErrorOverlay from '../../../components/UI/ErrorOverlay';
import Animated, { FadeInDown } from 'react-native-reanimated';
import IconButton from '../../../components/UI/IconButton';
import { deleteSpending } from '../../../utils/http/spending';
import SpendingForm from '../../../components/MinorStage/ManageSpending/SpendingForm';
import { StagesContext } from '../../../store/stages-context';
import HeaderTitle from '../../../components/UI/HeaderTitle';
import { generateRandomString } from '../../../utils';

interface ManageSpendingProps {
  navigation: NativeStackNavigationProp<
    MajorStageStackParamList,
    'ManageSpending'
  >;
  route: RouteProp<MajorStageStackParamList, 'ManageSpending'>;
}

interface ConfirmHandlerProps {
  error?: string;
  status: number;
  spending?: Spending;
  backendJourneyId?: number;
}

const ManageSpending: React.FC<ManageSpendingProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const stagesCtx = useContext(StagesContext);

  const { minorStageId, spendingId } = route.params;
  const minorStage = stagesCtx.findMinorStage(minorStageId);
  const isEditing = !!spendingId;

  let selectedSpending: Spending | undefined;

  if (spendingId) {
    selectedSpending = minorStage?.costs.spendings?.find(
      (spending) => spending.id === spendingId
    );
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitle title={isEditing ? 'Edit Spending' : 'Add Spending'} />
      ),
      headerStyle: { backgroundColor: GlobalStyles.colors.complementary700 },
    });
  }, [navigation]);

  // Empty, when no default values provided
  const defaultValues = useMemo<Spending | undefined>(() => {
    if (!selectedSpending) return undefined;
    return {
      name: selectedSpending?.name || '',
      amount: selectedSpending?.amount || 0,
      date: selectedSpending?.date || '',
      category: selectedSpending?.category || 'Other',
    };
  }, [selectedSpending]);

  async function deleteHandler() {
    try {
      const { error, status, backendJourneyId } = await deleteSpending(
        spendingId!
      );
      if (!error && status === 200) {
        stagesCtx.fetchStagesData();
        navigation.goBack();
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete spending!');
    }
  }

  async function confirmHandler({
    status,
    error,
    spending,
    backendJourneyId,
  }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else if (spending && status === 200) {
        stagesCtx.fetchStagesData();
        navigation.goBack();
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else if (spending && status === 201) {
        stagesCtx.fetchStagesData();
        navigation.goBack();
      }
    }
  }

  function cancelHandler() {
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <ComplementaryGradient />
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <Animated.ScrollView entering={FadeInDown} nestedScrollEnabled={true}>
        <SpendingForm
          key={isEditing ? String(spendingId) : generateRandomString()}
          minorStageId={minorStageId}
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={isEditing ? defaultValues : undefined}
          editSpendingId={spendingId}
          isEditing={isEditing}
        />
        {isEditing && (
          <View style={styles.btnContainer}>
            <IconButton
              icon={Icons.delete}
              color={GlobalStyles.colors.error200}
              onPress={deleteHandler}
              size={46}
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

export default ManageSpending;
